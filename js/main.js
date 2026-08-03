/* ============================================
   EH CONNECT ISP – Main JavaScript
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. NAVBAR – Scroll Effect & Background
  // ==========================================
  const navbar = document.querySelector('.navbar');

  const updateNavbar = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // initial check

  // ==========================================
  // 2. MOBILE MENU TOGGLE
  // ==========================================
  const toggleBtn = document.querySelector('.navbar-toggle');
  const navLinks = document.querySelector('.navbar-links');
  const navActions = document.querySelector('.navbar-actions');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');
      navLinks.classList.toggle('is-open');
      if (navActions) navActions.classList.toggle('is-open');
      document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
    });

    // Close menu on link click
    document.querySelectorAll('.navbar-links a').forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('active');
        navLinks.classList.remove('is-open');
        if (navActions) navActions.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        toggleBtn.classList.remove('active');
        navLinks.classList.remove('is-open');
        if (navActions) navActions.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================
  // 3. SCROLL SPY – Active Section Highlighting
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.navbar-links a[href^="#"]');

  const updateActiveSection = () => {
    let current = '';
    const scrollPos = window.scrollY + 120; // offset for navbar

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinksList.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();

  // ==========================================
  // 4. SCROLL ANIMATIONS (Intersection Observer)
  // ==========================================
  const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .stagger-children');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));

  // ==========================================
  // 5. SMOOTH SCROLL (for anchor links)
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================
  // 6. 3D PERSPECTIVE TILT EFFECT FOR CARDS
  // ==========================================
  if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const tiltCards = document.querySelectorAll('.glass-card, .plan-card, .audience-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;

        // Calculate light position for dynamic glow
        const lightX = (x / rect.width) * 100;
        const lightY = (y / rect.height) * 100;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px) scale(1.02)`;
        card.style.boxShadow = `
          ${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0, 0, 0, 0.3),
          0 0 30px rgba(0, 229, 255, ${0.05 + Math.abs(rotateX) * 0.01})
        `;

        // Dynamic light reflection via CSS custom property
        card.style.setProperty('--light-x', `${lightX}%`);
        card.style.setProperty('--light-y', `${lightY}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.removeProperty('--light-x');
        card.style.removeProperty('--light-y');
      });
    });
  }

  // ==========================================
  // 7. PERFORMANCE: Lazy load coverage map iframe
  // ==========================================
  const coverageMapFrame = document.querySelector('.coverage-map iframe[data-src]');
  if (coverageMapFrame) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          coverageMapFrame.src = coverageMapFrame.dataset.src;
          coverageMapFrame.removeAttribute('data-src');
          mapObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(coverageMapFrame);
  }

  // ==========================================
  // 8. REDUCED MOTION PREFERENCE CHECK
  // ==========================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    // Disable all animations
    document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .stagger-children').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('is-visible');
    });
  }

  // ==========================================
  // 9. FORM VALIDATION
  // ==========================================

  // Helper: validate a single field
  const validateField = (field) => {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return true;

    let valid = true;
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
      valid = false;
    } else if (field.type === 'email' && value) {
      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) valid = false;
    }

    formGroup.classList.toggle('has-error', !valid);
    formGroup.classList.toggle('has-success', valid && value.length > 0);
    return valid;
  };

  // Helper: validate all fields in a form
  const validateForm = (form) => {
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;
    fields.forEach(field => {
      if (!validateField(field)) allValid = false;
    });
    return allValid;
  };

  // Real-time validation on blur
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const formGroup = field.closest('.form-group');
      if (formGroup && formGroup.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  // --- Apply Form ---
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm(applyForm)) {
        // Focus first error field
        const firstError = applyForm.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate submission
      const submitBtn = applyForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      submitBtn.disabled = true;

      // Collect form data (for future billing system integration)
      const formData = new FormData(applyForm);
      const data = Object.fromEntries(formData.entries());

      console.log('📝 Application submitted:', data);

      // Simulate API call
      setTimeout(() => {
        applyForm.style.display = 'none';
        document.getElementById('applySuccess').classList.add('is-visible');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  // ==========================================
  // 10. HERO CAROUSEL 3D TILT EFFECT
  // ==========================================
  const heroVisual = document.querySelector('.hero-visual');
  const heroCarousel = document.querySelector('.hero-carousel');
  const heroGlow = document.querySelector('.hero-photo-glow');

  if (heroVisual && heroCarousel && window.innerWidth > 768 && !prefersReducedMotion.matches) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      heroCarousel.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.02)`;
      heroCarousel.style.boxShadow = `${-rotateY * 3}px ${rotateX * 3}px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 229, 255, 0.12)`;

      if (heroGlow) {
        heroGlow.style.background = `radial-gradient(ellipse 60% 60% at ${50 + rotateY * 2}% ${50 + rotateX * 2}%, rgba(0, 229, 255, 0.3) 0%, rgba(180, 77, 255, 0.15) 40%, transparent 70%)`;
      }
    });

    heroVisual.addEventListener('mouseleave', () => {
      heroCarousel.style.transform = '';
      heroCarousel.style.boxShadow = '';
      if (heroGlow) heroGlow.style.background = '';
    });
  }

  // ==========================================
  // 11. HERO IMAGE CAROUSEL
  // ==========================================
  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.hero-carousel-slide');
    const dots = carousel.querySelectorAll('.hero-carousel-dot');
    let currentSlide = 0;
    let carouselTimer = null;

    const showSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentSlide));
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentSlide);
        dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
      });
    };

    const startCarousel = () => {
      // No auto-rotation for reduced-motion users
      if (prefersReducedMotion.matches || slides.length < 2) return;
      carouselTimer = setInterval(() => showSlide(currentSlide + 1), 3000);
    };

    const stopCarousel = () => {
      if (carouselTimer) clearInterval(carouselTimer);
      carouselTimer = null;
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopCarousel();
        showSlide(i);
        startCarousel();
      });
    });

    // Pause on hover (desktop)
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);

    startCarousel();
  }

  // ==========================================
  // 12. PARTICLE CANVAS — Subtle Site-Wide Fiber Data Stream
  // ==========================================
  const particleCanvas = document.getElementById('particleCanvas');
  if (particleCanvas && !prefersReducedMotion.matches) {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = window.innerWidth < 768 ? 25 : 50;
    const CONNECTION_DISTANCE = 120;

    let resizeTimer;
    const resizeCanvas = () => {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    });

    class FiberParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.8 + 0.4;
        this.opacity = Math.random() * 0.3 + 0.08;
        const colors = ['0, 229, 255', '180, 77, 255', '0, 255, 136'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > particleCanvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > particleCanvas.height) this.vy *= -1;
      }
      draw() {
        ctx.save();
        ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new FiberParticle());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.07;
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  console.log('🚀 EH CONNECT ISP – Landing Page initialized');
});
