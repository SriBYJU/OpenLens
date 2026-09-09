import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, inspectImageHeader, validateDimensions, validateImageFile } from '../src/ai/images';

describe('local image resource limits', () => {
  it('rejects empty, oversized, and unapproved formats', () => {
    expect(() => validateImageFile({ size: 0, type: 'image/png' })).toThrow();
    expect(() => validateImageFile({ size: MAX_IMAGE_BYTES + 1, type: 'image/jpeg' })).toThrow();
    expect(() => validateImageFile({ size: 128, type: 'image/svg+xml' })).toThrow();
    expect(() => validateImageFile({ size: 128, type: 'text/html' })).toThrow();
  });
  it('accepts bounded supported uploads', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/webp']) expect(() => validateImageFile({ size: 2048, type })).not.toThrow();
  });
  it('rejects invalid, excessive, and decompression-heavy dimensions', () => {
    for (const dimensions of [[0, 500], [NaN, 400], [Infinity, 400], [8193, 1], [5000, 5000], [1.5, 3]]) {
      expect(() => validateDimensions(dimensions[0], dimensions[1])).toThrow();
    }
    expect(() => validateDimensions(4000, 4000)).not.toThrow();
  });
  it('reads actual PNG dimensions and rejects huge allocations before decoding', () => {
    const buffer = new ArrayBuffer(24);
    const bytes = new Uint8Array(buffer);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
    bytes.set([73, 72, 68, 82], 12);
    const view = new DataView(buffer);
    view.setUint32(16, 1200);
    view.setUint32(20, 650);
    expect(inspectImageHeader(buffer)).toEqual({ width: 1200, height: 650 });
    view.setUint32(16, 90000);
    expect(() => inspectImageHeader(buffer)).toThrow('too large');
  });
  it('rejects renamed non-images and truncated files', () => {
    expect(() => inspectImageHeader(new TextEncoder().encode('<html>not an image</html>').buffer)).toThrow('header');
    expect(() => inspectImageHeader(new ArrayBuffer(2))).toThrow('header');
  });
});
