// ============================================
// 3D TILT EFFECT FOR PROJECT CARDS
// ============================================

class CardTilt3D {
  constructor() {
    this.cards = document.querySelectorAll('.project-card');
    this.isEnabled =
      this.cards.length > 0 &&
      window.innerWidth > 980 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      (navigator.hardwareConcurrency || 8) >= 6;

    this.cardState = new WeakMap();

    if (this.isEnabled) {
      this.init();
    }
  }

  init() {
    this.cards.forEach(card => {
      this.cardState.set(card, { x: 0.5, y: 0.5, ticking: false });
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');

      card.addEventListener('mousemove', (e) => this.onMouseMove(e, card), { passive: true });
      card.addEventListener('mouseleave', () => this.onMouseLeave(card));
    });
  }

  onMouseMove(e, card) {
    const state = this.cardState.get(card);
    if (!state) {
      return;
    }

    const rect = card.getBoundingClientRect();
    state.x = (e.clientX - rect.left) / rect.width;
    state.y = (e.clientY - rect.top) / rect.height;

    if (state.ticking) {
      return;
    }

    state.ticking = true;
    requestAnimationFrame(() => {
      const rotateY = (state.x - 0.5) * 7;
      const rotateX = (0.5 - state.y) * 7;
      card.style.setProperty('--mouse-x', `${(state.x * 100).toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${(state.y * 100).toFixed(1)}%`);
      card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
      state.ticking = false;
    });
  }

  onMouseLeave(card) {
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  }
}

// ============================================
// PARALLAX DEPTH SCROLL EFFECT
// ============================================

class ParallaxDepth {
  constructor() {
    this.layers = document.querySelectorAll('[data-parallax]');
    this.window = window;
    this.ticking = false;
    this.isEnabled =
      this.layers.length > 0 &&
      window.innerWidth > 980 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      (navigator.hardwareConcurrency || 8) >= 6;
    
    if (this.isEnabled) {
      this.window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    }
  }

  onScroll() {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    requestAnimationFrame(() => {
      this.onScrollFrame();
      this.ticking = false;
    });
  }

  onScrollFrame() {
    this.layers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-parallax')) || 0.5;
      const offset = this.window.scrollY * Math.min(depth, 0.08);
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }
}

// ============================================
// 3D TEXT EFFECT WITH PERSPECTIVE
// ============================================

class TextPerspective {
  constructor() {
    this.textElements = document.querySelectorAll('.hero-text-3d');
    this.mouse = { x: 0, y: 0 };
    this.ticking = false;
    this.isEnabled =
      this.textElements.length > 0 &&
      window.innerWidth > 980 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.isEnabled) {
      return;
    }
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;

      if (!this.ticking) {
        this.ticking = true;
        requestAnimationFrame(() => {
          this.updatePerspective();
          this.ticking = false;
        });
      }
    }, { passive: true });
  }

  updatePerspective() {
    this.textElements.forEach(el => {
      const rotX = (this.mouse.y - 0.5) * 6;
      const rotY = (this.mouse.x - 0.5) * 6;
      
      el.style.transform = `
        perspective(1200px) 
        rotateX(${rotX}deg) 
        rotateY(${rotY}deg)
      `;
    });
  }
}

// ============================================
// INITIALIZE ALL 3D EFFECTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  new CardTilt3D();
  new ParallaxDepth();
  new TextPerspective();
});
