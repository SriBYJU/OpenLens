const root = document.documentElement;
const cinematic = document.querySelector('[data-cinematic]');
const glassesStage = document.querySelector('[data-glasses-stage]');
const glassesTilt = document.querySelector('[data-glasses-tilt]');
const heroCopy = document.querySelector('[data-hero-copy]');
const scrollCue = document.querySelector('[data-scroll-cue]');
const portal = document.querySelector('[data-portal]');
const lensHud = document.querySelector('[data-lens-hud]');
const header = document.querySelector('[data-header]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

let pointerX = 0;
let pointerY = 0;
let raf = 0;

function updateScroll() {
  raf = 0;
  if (!cinematic) return;

  const rect = cinematic.getBoundingClientRect();
  const total = Math.max(1, cinematic.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / total);

  root.style.setProperty('--scroll-progress', progress.toFixed(4));

  if (reducedMotion.matches) {
    glassesStage.style.transform = 'translate3d(0,0,0) scale(1)';
    glassesStage.style.opacity = progress > 0.72 ? '0' : '1';
    heroCopy.style.opacity = progress > 0.18 ? '0' : '1';
    portal.style.opacity = progress > 0.58 ? '1' : '0';
    return;
  }

  const approach = easeInOut(clamp((progress - 0.08) / 0.62));
  const enter = easeInOut(clamp((progress - 0.44) / 0.42));
  const dissolve = clamp((progress - 0.74) / 0.2);

  const scale = lerp(1, 8.35, enter);
  const x = lerp(0, -22, enter);
  const y = lerp(0, 2.5, enter);
  const rotate = lerp(0, -1.4, approach);
  glassesStage.style.transform = `translate3d(${x}vw, ${y}vh, 0) scale(${scale}) rotate(${rotate}deg)`;
  glassesStage.style.opacity = String(1 - dissolve);

  heroCopy.style.opacity = String(1 - clamp(progress / 0.24));
  heroCopy.style.transform = `translate3d(0, ${lerp(0, -30, clamp(progress / 0.28))}px, 0)`;
  scrollCue.style.opacity = String(1 - clamp(progress / 0.12));
  lensHud.style.opacity = String(clamp((progress - 0.16) / 0.18) * (1 - clamp((progress - 0.56) / 0.18)));

  const portalReveal = clamp((progress - 0.55) / 0.2);
  portal.style.opacity = String(portalReveal);
  portal.style.transform = `scale(${lerp(0.84, 1.15, portalReveal)})`;

  const headerBlend = clamp((progress - 0.62) / 0.16);
  header.style.setProperty('--header-alpha', String(lerp(0.48, 0.92, headerBlend)));
}

function requestUpdate() {
  if (!raf) raf = requestAnimationFrame(updateScroll);
}

window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate, { passive: true });
reducedMotion.addEventListener?.('change', requestUpdate);

window.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || !glassesTilt) return;
  pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
  pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  glassesTilt.style.setProperty('--pointer-x', pointerX.toFixed(3));
  glassesTilt.style.setProperty('--pointer-y', pointerY.toFixed(3));
}, { passive: true });

async function enhanceWithMotion() {
  try {
    const { animate, inView, stagger } = await import('https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm');
    inView('.system-rail article', (element) => {
      animate(element, { opacity: [0, 1], y: [28, 0] }, { duration: 0.7, easing: [0.22, 1, 0.36, 1] });
    }, { margin: '-8% 0px -8% 0px' });

    inView('.pipeline-row', () => {
      animate('.pipeline-row', { opacity: [0.35, 1], x: [-14, 0] }, { delay: stagger(0.08), duration: 0.48 });
    }, { amount: 0.35 });
  } catch {
    document.documentElement.classList.add('motion-fallback');
  }
}

enhanceWithMotion();
requestUpdate();
