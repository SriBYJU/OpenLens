import { useEffect, useRef, useState } from 'react';
import { canvasBlob, createDemoImage, decodeImage, validateDimensions } from '../ai/images';
import type { OcrMessage, OcrResult } from '../ai/types';

const OCR_TIMEOUT_MS = 90_000;

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
  const [localVoice, setLocalVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const mounted = useRef(false);
  const previewRef = useRef('');
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const mediaToken = useRef(0);
  const preparationToken = useRef(0);
  const cameraTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    const updateVoices = () => setLocalVoice(synthesis?.getVoices().find(voice => voice.localService && voice.lang.startsWith('en')) ?? null);
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

  function setPreparedImage(blob: Blob, label: string) {
    URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(blob);
    setPreview(previewRef.current);
    setImage(blob);
    setImageLabel(label);
    setResult(null);
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
      if (!mounted.current || token !== preparationToken.current) return;
      stopCamera();
      setPreparedImage(blob, source === 'demo' ? 'Generated library sign · demo image' : 'Your image · stored in memory only');
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
      if (!mounted.current || token !== preparationToken.current) return;
      setPreparedImage(blob, 'Camera capture · stored in memory only');
      stopCamera();
    } catch {
      if (mounted.current && token === preparationToken.current) setError('Camera capture failed. Try again or choose an image.');
    } finally {
      if (mounted.current && token === preparationToken.current) setPreparing(false);
    }
  }

  function speak() {
    if (!localVoice || !result?.text) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(result.text);
    utterance.voice = localVoice;
    utterance.lang = localVoice.lang;
    utterance.onend = utterance.onerror = () => { if (mounted.current) setSpeaking(false); };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return <section className="panel local-ai" aria-labelledby="local-ai-title">
    <div className="section-heading"><div><p className="eyebrow">ON YOUR DEVICE</p><h2 id="local-ai-title">Let the world speak.</h2></div><span className="status">Local OCR</span></div>
    <p className="muted">Read English text from a sign, label, or page. Try the sample, choose an image, or take a photo.</p>
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
    <div className="button-row">
      <button className="button primary" disabled={!image || busy || preparing} onClick={readImage}>{busy ? 'Reading…' : 'Read text locally'}</button>
      {busy && <button className="button" onClick={() => { stopWorker(); setBusy(false); setStatus('Reading cancelled'); }}>Cancel reading</button>}
      {image && !busy && !preparing && <button className="button" onClick={() => { preparationToken.current += 1; URL.revokeObjectURL(previewRef.current); previewRef.current = ''; setPreview(''); setImage(null); setResult(null); setError(''); setStatus('Image cleared'); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setSpeaking(false); }}>Clear image</button>}
    </div>
    <p className="status ai-status" role="status" aria-live="polite">{preparing ? 'Preparing image…' : status}</p>
    {error && <p className="notice error" role="alert">{error}</p>}
    {result && <div className="ocr-result">
      <h3>Recognized text</h3>
      <p className="ocr-text">{result.text || 'No text found. Try a sharper image with larger, well-lit lettering.'}</p>
      <p className="muted">{Math.round(result.confidence)}% engine confidence · {result.inferenceMs.toLocaleString()} ms recognition time in this browser (excludes model loading).</p>
      <p className="muted">OCR can make mistakes. Check important text against the original image.</p>
      {result.text && (localVoice ? <button className="button" onClick={speak}>{speaking ? 'Stop speaking' : 'Read aloud with local voice'}</button> : <p className="muted">No local English voice is available in this browser.</p>)}
    </div>}
    <p className="notice">Images are processed in this browser and never uploaded. The OCR engine and English model load from this site on demand. Model files may be cached; images and results are kept only in memory. Offline use depends on your browser cache.</p>
  </section>;
}
