(function () {
  const root = document.getElementById('zoom-photo');
  if (!root || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const copy = root.querySelector('.zoom-copy');
  const slot = root.querySelector('.zoom-slot');
  const frame = root.querySelector('.zoom-frame');
  const overlay = root.querySelector('.zoom-overlay');
  if (!copy || !slot || !frame || !overlay) return;

  const easeP = gsap.parseEase('power2.inOut');
  const ASPECT = 2000 / 1333;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  let start = {};

  function resetInline() {
    gsap.set([root, copy, slot, frame, overlay], { clearProps: 'all' });
  }

  function measure() {
    resetInline();
    const fr = frame.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    start = {
      rootH: root.offsetHeight,
      viewLeft: rr.left,
      left: fr.left - rr.left,
      top: fr.top - rr.top,
      w: fr.width,
      h: fr.height,
      contentW: root.clientWidth,
      vw: window.innerWidth,
      vh: window.innerHeight
    };
  }

  function render(raw) {
    const p = easeP(clamp(raw, 0, 1));
    const mob = isMobile();
    const expand = clamp((p - 0.08) / 0.92, 0, 1);

    gsap.set(copy, { opacity: clamp(1 - p * 2.2, 0, 1) });

    if (mob) {
      const endW = start.vw;
      const endH = Math.min(start.vh * 0.82, Math.max(endW / ASPECT, start.vh * 0.62));
      const endTop = (start.vh - endH) / 2;
      gsap.set(root, {
        width: lerp(start.contentW, start.vw, expand),
        height: lerp(start.rootH, start.vh, expand),
        x: lerp(0, -start.viewLeft, expand)
      });
      gsap.set(frame, {
        position: 'absolute',
        left: lerp(start.left, 0, expand),
        top: lerp(start.top, endTop, expand),
        width: lerp(start.w, endW, expand),
        height: lerp(start.h, endH, expand),
        margin: 0,
        zIndex: 2
      });
    } else {
      const w = lerp(start.w, start.contentW, expand);
      const h = w / ASPECT;
      gsap.set(root, { height: lerp(start.rootH, h, expand) });
      gsap.set(frame, {
        position: 'absolute',
        left: lerp(start.left, 0, expand),
        top: lerp(start.top, 0, expand),
        width: w,
        height: h,
        margin: 0,
        zIndex: 2
      });
    }

    gsap.set(overlay, { opacity: clamp((p - 0.48) / 0.32, 0, 1) });
  }

  if (motionQuery.matches) return;

  measure();
  render(0);

  ScrollTrigger.create({
    trigger: root,
    start: () => isMobile() ? 'top top' : 'top 18%',
    end: () => isMobile() ? '+=1600' : '+=1200',
    pin: true,
    pinSpacing: true,
    scrub: 0.25,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: self => {
      measure();
      render(self.progress);
    },
    onUpdate: self => render(self.progress)
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
