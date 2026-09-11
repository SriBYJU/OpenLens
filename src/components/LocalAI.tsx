import { useEffect, useRef, useState } from 'react';
import { canvasBlob, createDemoImage, decodeImage, validateDimensions } from '../ai/images';
import {phrasebookLanguages,signPhrasebook,translateSignText,type PhrasebookLanguage,type PhrasebookTranslation} from '../ai/phrasebook';
import {analyzeImageBlob,type VisualSignalProfile} from '../ai/vision-signals';
import type { OcrMessage, OcrResult } from '../ai/types';
import AIRouterLab from './AIRouterLab';
import '../local-ai-lab.css';

const OCR_TIMEOUT_MS = 90_000;
const voicePrefixes:Record<PhrasebookLanguage,string>={English:'en',Spanish:'es',French:'fr',German:'de',Italian:'it'};

export default function LocalAI() {
  const [image, setImage] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  const [imageLabel, setImageLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [status, setStatus] = useState('Ready for an image');
  const [error, setError] = useState('');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [camera, setCamera] = useState<'off' | 'requesting' | 'on'>('off');
  const [localVoices, setLocalVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [targetLanguage,setTargetLanguage]=useState<PhrasebookLanguage>('English');
  const [sourceLanguage,setSourceLanguage]=useState<PhrasebookLanguage>('English');
  const [translation,setTranslation]=useState<PhrasebookTranslation|null>(null);
  const [translationMs,setTranslationMs]=useState(0);
  const [translationStatus,setTranslationStatus]=useState('');
  const [visionSignal,setVisionSignal]=useState<VisualSignalProfile|null>(null);
  const mounted = useRef(false);
  const previewRef = useRef('');
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const mediaToken = useRef(0);
  const preparationToken = useRef(0);
  const cameraTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const spokenLanguage=translation?.targetLanguage??sourceLanguage;
  const localVoice=localVoices.find(voice=>voice.lang.toLowerCase().startsWith(voicePrefixes[spokenLanguage]));

  function stopWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  function stopCamera() {
    mediaToken.current += 1;
    if (cameraTimer.current) clearTimeout(cameraTimer.current);
    cameraTimer.current = null;
    mediaRef.current?.getTracks().forEach(track => track.stop());
    mediaRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (mounted.current) setCamera('off');
  }

  useEffect(() => {
    mounted.current = true;
    const synthesis = 'speechSynthesis' in window ? window.speechSynthesis : null;
    const updateVoices = () => setLocalVoices(synthesis?.getVoices().filter(voice => voice.localService) ?? []);
    updateVoices();
    synthesis?.addEventListener('voiceschanged', updateVoices);
    const onHidden = () => { if (document.hidden) stopCamera(); };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', stopCamera);
    return () => {
      mounted.current = false;
      preparationToken.current += 1;
      stopWorker();
      stopCamera();
      URL.revokeObjectURL(previewRef.current);
      synthesis?.cancel();
      synthesis?.removeEventListener('voiceschanged', updateVoices);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', stopCamera);
    };
  }, []);

  function setPreparedImage(blob: Blob, label: string, signal:VisualSignalProfile|null) {
    URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(blob);
    setPreview(previewRef.current);
    setImage(blob);
    setImageLabel(label);
    setResult(null);
    setTranslation(null);
    setTranslationStatus('');
    setVisionSignal(signal);
    setError('');
    setStatus('Image ready. Select Read text to start.');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  async function prepare(source: 'demo' | File) {
    if (workerRef.current) return;
    const token = ++preparationToken.current;
    setPreparing(true);
    setError('');
    setResult(null);
    try {
      const blob = source === 'demo' ? await createDemoImage() : await decodeImage(source);
      const signal=await analyzeImageBlob(blob).catch(()=>null);
      if (!mounted.current || token !== preparationToken.current) return;
      stopCamera();
      setPreparedImage(blob, source === 'demo' ? 'Generated library sign · demo image' : 'Your image · stored in memory only',signal);
    } catch (cause) {
      if (mounted.current && token === preparationToken.current) setError(cause instanceof Error ? cause.message : 'The image could not be opened.');
    } finally {
      if (mounted.current && token === preparationToken.current) setPreparing(false);
    }
  }

  function readImage() {
    if (!image || workerRef.current) return;
    setBusy(true);
    setError('');
    setResult(null);
    setTranslation(null);
    setTranslationStatus('');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setStatus('Loading local OCR engine and English model…');
    try {
      const worker = new Worker(new URL('../ai/ocr.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      const failed = (message: string) => {
        if (workerRef.current !== worker) return;
        stopWorker();
        setBusy(false);
        setStatus('Reading stopped');
        setError(message);
      };
      worker.onmessage = ({ data }: MessageEvent<OcrMessage>) => {
        if (!mounted.current || workerRef.current !== worker) return;
        if (data.type === 'progress') {
          const labels: Record<string, string> = {
            'loading tesseract core': 'Loading local WebAssembly engine',
            'initializing tesseract': 'Starting OCR engine',
            'loading language traineddata': 'Loading English model',
            'initializing api': 'Preparing English recognition',
            'recognizing text': 'Reading text in your browser',
          };
          setStatus(`${labels[data.status] ?? 'Preparing OCR'} · ${Math.round(Math.max(0, Math.min(1, data.progress || 0)) * 100)}%`);
        } else if (data.type === 'result') {
          setResult(data.result);
          setTranslation(null);
          setStatus(data.result.text ? 'Reading complete' : 'No readable text found');
          setBusy(false);
          stopWorker();
        } else {
          failed(navigator.onLine ? 'The local OCR engine could not start. Check that its model files are available, then retry.' : 'You are offline and OCR files may not be cached. Reconnect to load the engine, then retry.');
        }
      };
      worker.onerror = () => failed('The local OCR worker could not run. Retry in a current browser with WebAssembly enabled.');
      timeoutRef.current = setTimeout(() => failed('Reading timed out after 90 seconds. Try a smaller, sharper image and check your connection for the first model load.'), OCR_TIMEOUT_MS);
      worker.postMessage({ image });
    } catch {
      stopWorker();
      setBusy(false);
      setStatus('Reading stopped');
      setError('Web Workers are unavailable in this browser. Try a current browser.');
    }
  }

  async function startCamera() {
    if (mediaRef.current || camera === 'requesting') return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setError('Camera needs a supported browser on HTTPS or localhost. You can still use a demo or upload.');
      return;
    }
    const token = ++mediaToken.current;
    setCamera('requesting');
    cameraTimer.current = setTimeout(() => {
      if (token !== mediaToken.current) return;
      stopCamera();
      setError('Camera permission is still pending. Retry when you are ready to allow access.');
    }, 30_000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      if (!mounted.current || token !== mediaToken.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      if (cameraTimer.current) clearTimeout(cameraTimer.current);
      mediaRef.current = stream;
      setCamera('on');
      stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (mediaRef.current === stream) stopCamera();
      }, { once: true }));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cause) {
      if (!mounted.current || token !== mediaToken.current) return;
      stopCamera();
      setError(cause instanceof DOMException && cause.name === 'NotAllowedError' ? 'Camera permission was denied. Allow it in your browser or choose an image.' : 'Camera could not start. Check that a camera is connected and available.');
    }
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || preparing || busy) return;
    const token = ++preparationToken.current;
    setPreparing(true);
    try {
      validateDimensions(video.videoWidth, video.videoHeight);
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Image capture is unavailable.');
      ctx.drawImage(video, 0, 0);
      const blob = await canvasBlob(canvas);
      const signal=await analyzeImageBlob(blob).catch(()=>null);
      if (!mounted.current || token !== preparationToken.current) return;
      setPreparedImage(blob, 'Camera capture · stored in memory only',signal);
      stopCamera();
    } catch {
      if (mounted.current && token === preparationToken.current) setError('Camera capture failed. Try again or choose an image.');
    } finally {
      if (mounted.current && token === preparationToken.current) setPreparing(false);
    }
  }

  function runTranslation(){
    if(!result?.text)return;
    const started=performance.now();
    let translated:PhrasebookTranslation;
    try{translated=translateSignText(result.text,targetLanguage,sourceLanguage)}catch(cause){setTranslationStatus(cause instanceof Error?cause.message:'Translation failed.');return}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setTranslationMs(Math.max(.01,performance.now()-started));
    setTranslation(translated);
    setTranslationStatus(`Translated locally with ${translated.coverage}% phrasebook coverage.`);
  }

  async function copyOutput(){
    const value=translation?.output||result?.text;if(!value)return;
    try{await navigator.clipboard.writeText(value);setTranslationStatus('Output copied to the clipboard.')}catch{setTranslationStatus('Clipboard access was unavailable. Select the output text to copy it.')}
  }

  function exportOutput(){
    if(!result)return;
    const artifact={version:2,createdAt:new Date().toISOString(),mode:'local-browser',visionSignal,ocr:result,translation:translation??null,translationMs:translation?translationMs:null,disclosure:'Pixel signal analysis and OCR ran in this browser. Translation, when present, used the bounded OpenLens sign phrasebook and preserved unknown segments.'};
    const url=URL.createObjectURL(new Blob([JSON.stringify(artifact,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='openlens-local-ai-result.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);setTranslationStatus('Local pipeline artifact downloaded.');
  }

  function speak() {
    const value=translation?.output||result?.text;
    if (!localVoice || !value) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.voice = localVoice;
    utterance.lang = localVoice.lang;
    utterance.onend = utterance.onerror = () => { if (mounted.current) setSpeaking(false); };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return <section className="panel local-ai" aria-labelledby="local-ai-title">
    <div className="section-heading"><div><p className="eyebrow">ON YOUR DEVICE</p><h2 id="local-ai-title">Let the world speak.</h2></div><span className="status">Local OCR</span></div>
    <p className="muted">Read English text from a sign, label, or page. Try the sample, choose an image, or take a photo.</p>
    <AIRouterLab localVoice={Boolean(localVoice)}/>
    <div className="button-row">
      <button className="button" disabled={busy || preparing} onClick={() => void prepare('demo')}>Try demo image</button>
      <label className="field">Choose image<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || preparing} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void prepare(file); }} /></label>
      {camera === 'off' ? <button className="button" disabled={busy || preparing} onClick={() => void startCamera()}>Start camera</button> : <button className="button" onClick={stopCamera}>{camera === 'requesting' ? 'Cancel camera request' : 'Stop camera'}</button>}
    </div>
    <p className="muted">PNG, JPEG, or WebP · up to 8 MB / 16 megapixels · English text</p>
    <div hidden={camera === 'off'} className="camera-preview">
      <p role="status">{camera === 'on' ? 'Camera is on. Only a captured still image is used for OCR.' : 'Waiting for camera permission…'}</p>
      <video ref={videoRef} autoPlay muted playsInline aria-label="Live camera preview" className="ai-preview" />
      {camera === 'on' && <button className="button" disabled={preparing || busy} onClick={() => void capture()}>Capture image</button>}
    </div>
    {preview ? <figure className="ai-image"><img className="ai-preview" src={preview} alt={imageLabel} /><figcaption className="muted">{imageLabel}</figcaption></figure> : <div className="ai-empty"><span aria-hidden="true">Aa</span><p>Your image stays yours.</p><p className="muted">Choose a source above to get started.</p></div>}
    {visionSignal&&<section className="visual-signal" aria-labelledby="visual-signal-title"><header><h3 id="visual-signal-title">Optical signal preflight</h3><span>{visionSignal.width} × {visionSignal.height} SOURCE</span></header><div className="signal-grid">{[{label:'LUMINANCE',value:visionSignal.luminance,note:visionSignal.exposure},{label:'CONTRAST',value:visionSignal.contrast,note:'tonal spread'},{label:'EDGE DENSITY',value:visionSignal.edgeDensity,note:'local detail'},{label:'OCR READINESS',value:visionSignal.ocrReadiness,note:'heuristic'}].map(metric=><div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.note}</span><div className="signal-meter" aria-hidden="true"><i style={{width:`${metric.value}%`}}/></div></div>)}</div><p className="signal-notes">{visionSignal.notes.join(' ')}</p><p className="signal-disclosure"><b>REAL PIXEL ANALYSIS</b> · Samples luminance, contrast, and edges locally. The readiness number is a documented OCR preflight heuristic; it does not identify objects or claim semantic scene understanding.</p></section>}
    {image&&<div className="ai-model-route"><span>ROUTE 01</span><strong>IMAGE → LOCAL PIXEL PREFLIGHT → TESSERACT OCR → BOUNDED PHRASEBOOK → BROWSER VOICE</strong><small>ZERO API COST</small></div>}
    <div className="button-row">
      <button className="button primary" disabled={!image || busy || preparing} onClick={readImage}>{busy ? 'Reading…' : 'Read text locally'}</button>
      {busy && <button className="button" onClick={() => { stopWorker(); setBusy(false); setStatus('Reading cancelled'); }}>Cancel reading</button>}
      {image && !busy && !preparing && <button className="button" onClick={() => { preparationToken.current += 1; URL.revokeObjectURL(previewRef.current); previewRef.current = ''; setPreview(''); setImage(null); setVisionSignal(null); setResult(null); setTranslation(null); setTranslationStatus(''); setError(''); setStatus('Image cleared'); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setSpeaking(false); }}>Clear image</button>}
    </div>
    <p className="status ai-status" role="status" aria-live="polite">{preparing ? 'Preparing image…' : status}</p>
    {error && <p className="notice error" role="alert">{error}</p>}
    {result && <div className="ocr-result">
      <h3>Recognized text</h3>
      <p className="ocr-text">{result.text || 'No text found. Try a sharper image with larger, well-lit lettering.'}</p>
      <p className="muted">{Math.round(result.confidence)}% engine confidence · {result.inferenceMs.toLocaleString()} ms recognition time in this browser (excludes model loading).</p>
      <p className="muted">OCR can make mistakes. Check important text against the original image.</p>
      {result.text&&<div className="translation-workbench"><div>{(['source','target'] as const).map(direction=><label key={direction}>{direction==='source'?'Source language':'Translate sign phrase to'}<select aria-label={direction==='source'?'Translation source language':'Translation target language'} value={direction==='source'?sourceLanguage:targetLanguage} onChange={event=>{const language=event.target.value as PhrasebookLanguage;if(direction==='source')setSourceLanguage(language);else setTargetLanguage(language);setTranslation(null);if('speechSynthesis' in window)window.speechSynthesis.cancel();setSpeaking(false);setTranslationStatus('Language changed. Run translation to update the output.')}}>{phrasebookLanguages.map(language=><option key={language}>{language}</option>)}</select></label>)}<button className="button" onClick={runTranslation}>Translate locally</button></div><p>This offline phrasebook covers {signPhrasebook.length} navigation, safety, transit, and access phrases across five languages. Use short signs; sentence grammar and negation are not interpreted. OCR uses an English model, so verify accented text. Unknown or ambiguous words remain unchanged.</p></div>}
      {translation&&<div className="translation-result"><div className="ai-pipeline" aria-label="Local AI pipeline"><article><span>01 / PERCEIVE</span><strong>OCR complete</strong><small>{result.inferenceMs.toLocaleString()} ms · {Math.round(result.confidence)}% confidence</small></article><i>→</i><article><span>02 / TRANSFORM</span><strong>Phrasebook matched</strong><small>{translationMs.toFixed(2)} ms · {translation.coverage}% coverage</small></article><i>→</i><article><span>03 / OUTPUT</span><strong>{targetLanguage}</strong><small>{translation.unknownSegments.length} unknown segment{translation.unknownSegments.length===1?'':'s'}</small></article></div><h3>Translated output</h3><p className="translated-text">{translation.output}</p>{translation.unknownSegments.length>0&&<p className="translation-warning"><b>UNCHANGED:</b> {translation.unknownSegments.join(', ')}</p>}<p className="muted">{translation.disclosure}</p></div>}
      {result.text&&<div className="button-row"><button className="button" onClick={()=>void copyOutput()}>Copy {translation?'translation':'recognized text'}</button><button className="button" onClick={exportOutput}>Download result JSON</button>{localVoice?<button className="button" onClick={speak}>{speaking?'Stop speaking':`Speak ${translation?'translation':'recognized text'}`}</button>:<p className="muted">No local {spokenLanguage} voice is available in this browser.</p>}</div>}
      {translationStatus&&<p className="status" role="status" aria-live="polite">{translationStatus}</p>}
    </div>}
    <p className="notice">Images are processed in this browser and never uploaded. The OCR engine and English model load from this site on demand. Model files may be cached; images and results are kept only in memory. Offline use depends on your browser cache.</p>
  </section>;
}
