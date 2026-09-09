export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 16_000_000;
export const MAX_IMAGE_SIDE = 8192;

export function validateImageFile(file: Pick<File, 'size' | 'type'>): void {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG, or WebP image.');
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) throw new Error('Choose an image smaller than 8 MB.');
}

export function validateDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS) {
    throw new Error('Image is too large. Use up to 16 megapixels and 8,192 pixels per side.');
  }
}

/** Check encoded dimensions before asking the browser to allocate decoded pixels. */
export function inspectImageHeader(buffer: ArrayBuffer): { width: number; height: number } {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const text = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  let width = 0;
  let height = 0;
  if (bytes.length >= 24 && bytes[0] === 137 && text(1, 3) === 'PNG' && text(12, 4) === 'IHDR') {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (bytes.length >= 12 && bytes[0] === 255 && bytes[1] === 216) {
    let cursor = 2;
    while (cursor + 4 < bytes.length) {
      if (bytes[cursor] !== 255) break;
      while (bytes[cursor] === 255) cursor++;
      const marker = bytes[cursor++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (cursor + 2 > bytes.length) break;
      const length = view.getUint16(cursor);
      if (length < 2 || cursor + length > bytes.length) break;
      if (marker >= 192 && marker <= 207 && ![196, 200, 204].includes(marker) && length >= 7) {
        height = view.getUint16(cursor + 3);
        width = view.getUint16(cursor + 5);
        break;
      }
      cursor += length;
    }
  } else if (bytes.length >= 30 && text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP') {
    if (text(12, 4) === 'VP8X') {
      width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    } else if (text(12, 4) === 'VP8 ' && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) {
      width = view.getUint16(26, true) & 0x3fff;
      height = view.getUint16(28, true) & 0x3fff;
    } else if (text(12, 4) === 'VP8L' && bytes[20] === 47) {
      width = 1 + (((bytes[22] & 0x3f) << 8) | bytes[21]);
      height = 1 + (((bytes[24] & 0xf) << 10) | (bytes[23] << 2) | (bytes[22] >> 6));
    }
  }
  if (!width || !height) throw new Error('This image has an unsupported or invalid header. Try another PNG, JPEG, or WebP.');
  validateDimensions(width, height);
  return { width, height };
}

export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The image could not be prepared.')), 'image/png'));
}

/** Decode locally, enforce pixel limits, then normalize to a bounded raster. */
export async function decodeImage(file: File): Promise<Blob> {
  validateImageFile(file);
  inspectImageHeader(await file.arrayBuffer());
  const url = URL.createObjectURL(file);
  const img = new Image();
  try {
    img.src = url;
    await img.decode();
    validateDimensions(img.naturalWidth, img.naturalHeight);
    const scale = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable in this browser.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await canvasBlob(canvas);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Image is too large')) throw error;
    throw new Error('This image could not be decoded. Try another PNG, JPEG, or WebP.', { cause: error });
  } finally {
    img.src = '';
    URL.revokeObjectURL(url);
  }
}

export async function createDemoImage(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 650;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  ctx.fillStyle = '#f6f4ed';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#203e35';
  ctx.fillRect(90, 90, 1020, 470);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(112, 112, 976, 426);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 74px Arial, sans-serif';
  ctx.fillText('RIVERSIDE LIBRARY', 600, 248);
  ctx.font = '48px Arial, sans-serif';
  ctx.fillText('Open Monday to Saturday', 600, 352);
  ctx.fillText('9:00 AM - 6:00 PM', 600, 435);
  return canvasBlob(canvas);
}
