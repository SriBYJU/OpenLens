import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(root, 'public', 'ocr');
await mkdir(path.join(target, 'core'), { recursive: true });
await mkdir(path.join(target, 'lang'), { recursive: true });
await copyFile(path.join(root, 'node_modules/tesseract.js/dist/worker.min.js'), path.join(target, 'worker.min.js'));
const core = path.join(root, 'node_modules/tesseract.js-core');
for (const name of await readdir(core)) {
  if (name.endsWith('.wasm.js')) await copyFile(path.join(core, name), path.join(target, 'core', name));
}
await copyFile(path.join(root, 'node_modules/tesseract.js-core/LICENSE'), path.join(target, 'core', 'LICENSE'));
console.log('Prepared local OCR worker and WebAssembly engines. English model must be present in public/ocr/lang.');
