# OpenLens design direction — September 2026

## Product and audience
An optical instrument for builders inspecting smart-glasses behavior. The working object, controls and evidence come first. Explanations belong beside the relevant decision or in a clearly named disclosure.

## Two surfaces
- The opening is a dark studio: detailed graphite glasses, reflected ambient light, a continuous approach through the lens. The current concept asset is `public/assets/openlens-glasses-hero-v2.png`; it is not a photograph of a manufactured device.
- Working screens are charcoal instruments and editorial records. Lens Lab uses a restrained sage accent for optical signal and warm white for primary text. Status text accompanies every status color. The field guide uses numbered records, source status and labeled specifications, without generic device illustrations.

## Type and geometry
- UI/body: locally available Segoe UI, Helvetica Neue, Arial; readable body copy at 15–16 px or larger.
- Display: restrained system sans with the existing serif italic accent. Compact tool headings replace oversized marketing introductions.
- Monospace is reserved for short telemetry. Explanatory text uses the body font.
- Hairlines divide information. Small radii belong to real controls and instrument boundaries. Avoid card grids inside card grids.

## Motion and truth
- Home: approach → lens entry → perception. Opacity stays continuous through the entire transition; phase changes control focus eligibility, not premature visual cuts.
- Fixture diagrams react to authored environment inputs. Brightness and blur communicate the synthetic model; they are not calibrated optical or camera measurements.
- No autonomous shaking or waveform playback. Reduced-motion removes transitional effects.
- Real OCR, fixture simulation, bounded phrase lookup and physical hardware claims remain visibly distinct.

## Responsive and verification
The scene and run action remain in the first phone viewport. The full configuration follows. Desktop keeps controls beside the scene. Device records stack without horizontal page overflow. Test actual browser screenshots at 375, 768 and 1280 px, check keyboard focus and contrast, and retain all executable flows.
