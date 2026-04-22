/* ═══════════════════════════════════════════════════════
   LoveYou3000 — Cinematic Engine
   Scroll-driven frame animation + portfolio logic
   ═══════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── Config ──
  const TOTAL      = 300;
  const DIR        = 'new video frame/';
  const PREFIX     = 'ezgif-frame-';
  const EXT        = '.png';
  const FAST_COUNT = 20;

  // ── DOM References ──
  const $ = id => document.getElementById(id);
  const cinema     = $('cinema');
  const canvas     = $('canvas');
  const ctx        = canvas.getContext('2d');
  const progress   = $('cinema-progress');
  const hint       = $('cinema-hint');
  const loader     = $('loader');
  const loaderFill = $('loader-fill');
  const loaderText = $('loader-text');
  const nav        = $('nav');
  const spacer     = $('scroll-spacer');

  // ── State ──
  const frames   = new Array(TOTAL);
  let currentIdx = 0;
  let targetIdx  = 0;
  let needsDraw  = false;
  let ready      = false;


  /* ═══════════════════════════════════════════════════════
     CANVAS — Full Viewport Rendering
     ═══════════════════════════════════════════════════════ */

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    needsDraw = true;
  }

  function drawFrame(idx) {
    let img = frames[idx];
    // Fallback to nearest loaded frame
    if (!img) {
      for (let i = idx - 1; i >= 0; i--) {
        if (frames[i]) { img = frames[i]; break; }
      }
    }
    if (!img) return;

    const cW = canvas.width;
    const cH = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cW / cH;
    let dW, dH;

    // Adaptive: portrait (mobile) = contain, landscape = cover
    if (cH > cW) {
      dW = cW;
      dH = cW / ir;
    } else {
      if (cr > ir) {
        dW = cW;
        dH = cW / ir;
      } else {
        dH = cH;
        dW = cH * ir;
      }
    }

    // 4% crop to remove source edge artifacts
    const CROP = 1.04;
    dW *= CROP;
    dH *= CROP;

    const dX = (cW - dW) / 2;
    const dY = (cH - dH) / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cW, cH);
    ctx.drawImage(img, dX, dY, dW, dH);
  }


  /* ═══════════════════════════════════════════════════════
     RENDER LOOP
     ═══════════════════════════════════════════════════════ */

  function renderLoop() {
    if (ready && (needsDraw || targetIdx !== currentIdx)) {
      currentIdx = targetIdx;
      drawFrame(currentIdx);
      needsDraw = false;
    }
    requestAnimationFrame(renderLoop);
  }


  /* ═══════════════════════════════════════════════════════
     SCROLL HANDLER — Drives the animation
     ═══════════════════════════════════════════════════════ */

  function onScroll() {
    if (!ready) return;

    const spacerH  = spacer.offsetHeight;
    const scrollY  = window.scrollY;
    const scrollProgress = Math.max(0, Math.min(1, scrollY / spacerH));

    // Map scroll to frame index
    targetIdx = Math.min(TOTAL - 1, Math.floor(scrollProgress * TOTAL));

    // Update progress bar
    progress.style.width = (scrollProgress * 100) + '%';

    // Hide scroll hint after user starts scrolling
    if (scrollProgress > 0.02) {
      hint.classList.add('hidden');
    } else {
      hint.classList.remove('hidden');
    }

    // Fade out cinema at the end of animation
    if (scrollProgress < 0.98) {
      cinema.classList.remove('fade-out');
      cinema.style.display = '';
      progress.style.opacity = '1';
    } else {
      cinema.classList.add('fade-out');
      progress.style.opacity = '0';
    }

    // Nav glass effect when past animation
    if (nav) {
      if (scrollY > spacerH + 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  }


  /* ═══════════════════════════════════════════════════════
     FRAME LOADER
     ═══════════════════════════════════════════════════════ */

  function loadFrame(i) {
    return new Promise(resolve => {
      const img = new Image();
      const num = String(i + 1).padStart(3, '0');
      img.src = `${DIR}${PREFIX}${num}${EXT}`;
      img.onload  = () => { frames[i] = img; resolve(); };
      img.onerror = () => { frames[i] = null; resolve(); };
    });
  }

  // Phase 1: Load first batch for fast start
  async function priorityLoad() {
    const batch = [];
    for (let i = 0; i < FAST_COUNT; i++) {
      batch.push(loadFrame(i).then(() => {
        const pct = Math.round(((i + 1) / FAST_COUNT) * 100);
        loaderFill.style.width = pct + '%';
        loaderText.textContent = pct + '%';
      }));
    }
    await Promise.all(batch);
  }

  // Phase 2: Stream remaining frames in background
  async function backgroundStream() {
    for (let i = FAST_COUNT; i < TOTAL; i += 5) {
      const chunk = [];
      for (let j = i; j < Math.min(i + 5, TOTAL); j++) {
        chunk.push(loadFrame(j));
      }
      await Promise.all(chunk);
      await new Promise(r => setTimeout(r, 20));
    }
  }


  /* ═══════════════════════════════════════════════════════
     REVEAL ANIMATIONS (IntersectionObserver)
     ═══════════════════════════════════════════════════════ */

  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Trigger count-up animations
          entry.target.querySelectorAll('[data-count]').forEach(el => {
            if (el.dataset.animated) return;
            el.dataset.animated = '1';
            const target = parseInt(el.dataset.count);
            let current  = 0;
            const step   = target / 60;
            (function tick() {
              current += step;
              if (current < target) {
                el.textContent = Math.round(current).toLocaleString();
                requestAnimationFrame(tick);
              } else {
                el.textContent = target.toLocaleString() + (el.dataset.suffix || '');
              }
            })();
          });

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      observer.observe(el);
    });

    // Immediately reveal hero elements with stagger
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 400 + i * 180);
    });
  }


  /* ═══════════════════════════════════════════════════════
     KEYBOARD — Arrow keys for frame stepping
     ═══════════════════════════════════════════════════════ */

  function initKeyboard() {
    window.addEventListener('keydown', e => {
      if (!ready) return;
      if (e.code === 'ArrowRight') {
        targetIdx = Math.min(TOTAL - 1, targetIdx + 1);
      }
      if (e.code === 'ArrowLeft') {
        targetIdx = Math.max(0, targetIdx - 1);
      }
    });
  }


  /* ═══════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════ */

  async function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load first frames
    await priorityLoad();

    // Go live
    ready = true;
    loader.classList.add('hidden');
    loader.addEventListener('transitionend', () => {
      loader.style.display = 'none';
    }, { once: true });

    drawFrame(0);
    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(renderLoop);
    initReveal();
    initKeyboard();
    onScroll();

    // Stream remaining frames
    backgroundStream();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
