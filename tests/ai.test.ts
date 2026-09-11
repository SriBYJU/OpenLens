import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, inspectImageHeader, validateDimensions, validateImageFile } from '../src/ai/images';
import {translateSignText} from '../src/ai/phrasebook';
import {analyzeVisualSignal} from '../src/ai/vision-signals';

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

describe('local sign phrasebook',()=>{
  it('translates supported sign phrases without a provider or network',()=>{
    expect(translateSignText('SALIDA', 'French','Spanish')).toMatchObject({output:'SORTIE',coverage:100,sourceLanguage:'Spanish',unknownSegments:[]});
    expect(translateSignText('DANGER LEFT', 'Spanish')).toMatchObject({output:'PELIGRO IZQUIERDA',coverage:100});
  });
  it('preserves unknown segments and reports exact coverage',()=>{
    expect(translateSignText('EXIT OAK STREET', 'French')).toMatchObject({output:'SORTIE OAK STREET',coverage:33,unknownSegments:['OAK','STREET']});
  });
  it('returns a zero-coverage result for empty input',()=>expect(translateSignText('  ', 'German')).toMatchObject({output:'  ',coverage:0,matchedConcepts:[]}));
  it('preserves punctuation, case, numbers, newlines and unsupported scripts',()=>{
    expect(translateSignText('Exit: Oak St.\n9:00 — 東京', 'Spanish').output).toBe('SALIDA: Oak St.\n9:00 — 東京');
  });
  it('does not match multiword phrases across lines or silently resolve ambiguity',()=>{
    expect(translateSignText('NO\nENTRY', 'French').coverage).toBe(0);
    expect(translateSignText('USCITA','German','Italian')).toMatchObject({output:'USCITA',coverage:0,unknownSegments:['USCITA']});
  });
  it('rejects unbounded input and invalid language values',()=>{
    expect(()=>translateSignText('X'.repeat(20001),'French')).toThrow('20,000');
    expect(()=>translateSignText('EXIT','invalid' as 'French')).toThrow('language');
  });
});

describe('local optical signal preflight',()=>{
  it('measures real pixel luminance, contrast, edges, and a bounded readiness score',()=>{
    const data=new Uint8ClampedArray([
      0,0,0,255,255,255,255,255,
      255,255,255,255,0,0,0,255,
    ]);
    const profile=analyzeVisualSignal(data,2,2);
    expect(profile).toMatchObject({width:2,height:2,luminance:50,exposure:'balanced',dominantTone:'neutral'});
    expect(profile.contrast).toBeGreaterThan(90);
    expect(profile.edgeDensity).toBe(100);
    expect(profile.ocrReadiness).toBeGreaterThanOrEqual(0);
    expect(profile.ocrReadiness).toBeLessThanOrEqual(100);
  });
  it('rejects mismatched pixel buffers',()=>expect(()=>analyzeVisualSignal(new Uint8ClampedArray(4),2,2)).toThrow('dimensions'));
});
