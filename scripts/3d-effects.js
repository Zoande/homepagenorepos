// ============================================
// 3D TILT EFFECT FOR PROJECT CARDS
// ============================================

class CardTilt3D {
  constructor() {
    this.cards = document.querySelectorAll('.project-card');
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.onMouseMove(e, card));
      card.addEventListener('mouseleave', (e) => this.onMouseLeave(e, card));
    });
  }

  onMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate angle for 3D rotation
    const rotateY = ((mouseX - centerX) / centerX) * 15;
    const rotateX = ((centerY - mouseY) / centerY) * 15;
    
    // Store mouse position for light reflection
    const percentX = (mouseX / rect.width) * 100;
    const percentY = (mouseY / rect.height) * 100;
    
    card.style.setProperty('--mouse-x', percentX + '%');
    card.style.setProperty('--mouse-y', percentY + '%');
    card.style.setProperty('--rotateX', rotateX + 'deg');
    card.style.setProperty('--rotateY', rotateY + 'deg');

    // Add glow effect
    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + 
      Math.pow(mouseY - centerY, 2)
    );
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const intensity = 1 - (distance / maxDistance);

    card.style.boxShadow = `
      0 0 ${20 + intensity * 40}px rgba(155, 107, 168, ${0.2 + intensity * 0.3}),
      0 ${intensity * 20}px ${40 + intensity * 20}px rgba(0, 0, 0, ${0.1 + intensity * 0.2})
    `;
  }

  onMouseLeave(e, card) {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.boxShadow = '';
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    card.style.setProperty('--rotateX', '0deg');
    card.style.setProperty('--rotateY', '0deg');
  }
}

// ============================================
// PARALLAX DEPTH SCROLL EFFECT
// ============================================

class ParallaxDepth {
  constructor() {
    this.layers = document.querySelectorAll('[data-parallax]');
    this.window = window;
    
    if (this.layers.length > 0) {
      this.window.addEventListener('scroll', () => this.onScroll());
    }
  }

  onScroll() {
    this.layers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-parallax')) || 0.5;
      const offset = this.window.scrollY * depth;
      layer.style.transform = `translateY(${offset}px)`;
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
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
      this.updatePerspective();
    });
  }

  updatePerspective() {
    this.textElements.forEach(el => {
      const rotX = (this.mouse.y - 0.5) * 10;
      const rotY = (this.mouse.x - 0.5) * 10;
      
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
