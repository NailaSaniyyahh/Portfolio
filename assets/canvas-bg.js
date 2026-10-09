/**
 * Clean & Calm Emerald Canvas Engine (For Green Background)
 * Minimalist, eye-catching ambient particle network in shades of emerald, mint, and white.
 * Simple, low-intensity physics with gentle drift and soft cursor interaction.
 */

(function () {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion = motionQuery.matches;

  motionQuery.addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
    if (prefersReducedMotion) {
      cancelAnimationFrame(animId);
      renderStatic();
    } else {
      lastTime = performance.now();
      animId = requestAnimationFrame(animate);
    }
  });

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animId = null;
  let lastTime = 0;

  // Calm mouse state
  const mouse = {
    x: -9999,
    y: -9999,
    active: false,
    radius: 120,
  };

  // Particles tuned for fresh green background (gentle, non-dazzling)
  const GREEN_COLORS = [
    'rgba(5, 150, 105, ',   // Deep emerald
    'rgba(16, 185, 129, ',  // Bright emerald
    'rgba(52, 211, 153, ',  // Luminous mint
    'rgba(230, 238, 233, ', // Soft off-white pearl gray
  ];

  class Particle {
    constructor(randomY = true) {
      this.init(randomY);
    }

    init(randomY = true) {
      this.x = Math.random() * width;
      this.y = randomY ? Math.random() * height : height + 10;
      this.radius = 1.3 + Math.random() * 2.2;
      this.color = GREEN_COLORS[Math.floor(Math.random() * GREEN_COLORS.length)];
      this.baseAlpha = 0.28 + Math.random() * 0.45;

      // Gentle, calm upward drift
      this.vy = -(0.18 + Math.random() * 0.25);
      this.vx = (Math.random() - 0.5) * 0.15;

      this.dx = 0;
      this.dy = 0;
      this.phase = Math.random() * Math.PI * 2;
    }

    update(t) {
      this.y += this.vy + this.dy;
      this.x += this.vx + this.dx + Math.sin(t * 0.001 + this.phase) * 0.1;

      this.dx *= 0.92;
      this.dy *= 0.92;

      if (mouse.active) {
        const mx = this.x - mouse.x;
        const my = this.y - mouse.y;
        const distSq = mx * mx + my * my;
        const maxDist = mouse.radius;

        if (distSq < maxDist * maxDist && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxDist) * 1.2;
          this.dx += (mx / dist) * force;
          this.dy += (my / dist) * force;
        }
      }

      if (this.y < -15) {
        this.y = height + 10;
        this.x = Math.random() * width;
      }
      if (this.x < -15) this.x = width + 10;
      if (this.x > width + 15) this.x = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.baseAlpha + ')';
      ctx.fill();

      // Soft inner dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 238, 233, ' + (this.baseAlpha * 0.9) + ')';
      ctx.fill();
    }
  }

  let particles = [];

  function initParticles() {
    particles = [];
    const count = Math.floor(Math.max(28, Math.min(60, (width * height) / 25000)));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(true));
    }
  }

  function drawConnections() {
    const len = particles.length;
    const maxDist = 95;

    for (let i = 0; i < len; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDist * maxDist) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / maxDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(5, 150, 105, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    initParticles();
    if (prefersReducedMotion) renderStatic();
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
    }
  }

  function animate(t) {
    if (prefersReducedMotion) return;
    lastTime = t;

    ctx.clearRect(0, 0, width, height);
    drawConnections();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(t);
      particles[i].draw();
    }

    animId = requestAnimationFrame(animate);
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  window.addEventListener(
    'mousemove',
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    },
    { passive: true }
  );

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('blur', () => {
    mouse.active = false;
  });

  resize();
  if (!prefersReducedMotion) {
    animId = requestAnimationFrame(animate);
  }
})();
