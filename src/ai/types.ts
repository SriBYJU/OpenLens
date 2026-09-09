export type OcrResult = { text: string; confidence: number; inferenceMs: number };
export type OcrMessage =
  | { type: 'progress'; status: string; progress: number }
  | { type: 'result'; result: OcrResult }
  | { type: 'error' };
export type OcrRequest = { image: Blob; assetBase: string };
