# OpenLens Design System — Foundation v0.1

## Intent
OpenLens should feel like an optical instrument and developer platform, not a generic dark SaaS site. The visual language is built from **vision, optics, glass, depth, light, field-of-view geometry and hardware detail**.

## Palette
- Background: `#060708`
- Raised background: `#0A0D10`
- Surface: `#0D1115`
- Primary text: `#F4F7F8`
- Muted text: `#9AA8AF`
- Optical accent: `#9BDCF3`
- Highlight: `#D8F6FF`
- Hairline: `rgba(196,225,238,.13)`

The accent is intentionally desaturated and should appear as reflected optical light rather than neon.

## Typography
- Display: Space Grotesk 500–600
- UI/body: Inter 400–700
- Telemetry: system monospace
- Display tracking should be tight; telemetry tracking should be loose.

## Geometry
- Large radii are reserved for real containers such as Lens Lab and the header.
- Avoid endless rounded cards and pill-shaped labels.
- Technical content should often use lines, rails, grids and measurement geometry.

## Motion
Motion must explain spatial hierarchy.
- Hero: approach → enter right lens → optical atmosphere → perception layer.
- Pointer parallax is subtle and disabled on mobile/reduced motion.
- `prefers-reduced-motion` receives a deliberate non-zoom transition.
- Native animation is the baseline fallback; Motion 13.2.0 progressively enhances in-view content.

## Cinematic hero architecture
The smart glasses are procedural SVG, not a raster hero image. This lets future work:
1. separate frame/lens/sensor layers,
2. move to WebGL or React Three Fiber without changing the narrative,
3. add device-specific variants,
4. animate optical reflections and telemetry independently.

## Mobile
Mobile is intentionally different:
- larger crop on the glasses,
- no hover/parallax,
- lighter effects,
- stacked systems and telemetry,
- preserved scroll-through-lens concept with less transform complexity.
