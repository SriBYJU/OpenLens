import { createWorker, OEM, PSM } from 'tesseract.js';
import type { OcrMessage, OcrRequest } from './types';

// A controller worker owns the engine worker. Terminating this worker cancels
// its descendants, including while createWorker is still initializing.
const report = (message: OcrMessage) => self.postMessage(message);
self.onmessage = async (event: MessageEvent<OcrRequest>) => {
  const { image } = event.data;
  let engine: Awaited<ReturnType<typeof createWorker>> | undefined;
  try {
    if (!(image instanceof Blob) || image.size === 0 || image.size > 20 * 1024 * 1024 || !image.type.startsWith('image/')) {
      throw new Error('Invalid OCR image');
    }
    // Resolve engine assets inside this deployment. The page cannot instruct the
    // worker to load executable code or model files from another origin.
    const assetBase = new URL('../ocr/', self.location.href).href.replace(/\/$/, '');
    engine = await createWorker('eng', OEM.LSTM_ONLY, {
      workerPath: `${assetBase}/worker.min.js`,
      corePath: `${assetBase}/core`,
      langPath: `${assetBase}/lang`,
      workerBlobURL: false,
      cacheMethod: 'write',
      logger: ({ status, progress }) => report({ type: 'progress', status, progress }),
      errorHandler: () => report({ type: 'error' }),
    });
    await engine.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    const started = performance.now();
    const { data } = await engine.recognize(image);
    report({ type: 'result', result: { text: data.text.trim(), confidence: data.confidence, inferenceMs: Math.round(performance.now() - started) } });
  } catch {
    report({ type: 'error' });
  } finally {
    await engine?.terminate();
  }
};
