/* ============================================
   EH CONNECT ISP – Main JavaScript
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. NAVBAR – Scroll Effect
  // ==========================================
  const navbar = document.getElementById('navbar');

  const updateNavbar = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ==========================================
  // 2. MOBILE MENU TOGGLE
  // ==========================================
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navActions = document.getElementById('navActions');

  const setMenu = (open) => {
    if (!navToggle || !navLinks) return;
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    if (navActions) navActions.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      setMenu(!navLinks.classList.contains('is-open'));
    });

    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  // ==========================================
  // 3. SCROLL SPY – Active Section Highlighting
  // ==========================================
  const navLinksList = document.querySelectorAll('.navbar-links a[href^="#"]');

  const updateActiveSection = () => {
    const scrollPos = window.scrollY + 140;
    let current = '';

    document.querySelectorAll('section[id]').forEach((section) => {
      const top = section.offsetTop;
      if (scrollPos >= top) current = section.id;
    });

    navLinksList.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();

  // ==========================================
  // 4. SCROLL ANIMATIONS (Intersection Observer)
  // ==========================================
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealTargets = document.querySelectorAll(
    '.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .stagger-children'
  );

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

    revealTargets.forEach((el) => observer.observe(el));
  }

  // ==========================================
  // 5. SMOOTH SCROLL (anchor links)
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = (navbar ? navbar.offsetHeight : 0) + 16;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });

      // Move focus to the section for keyboard/screen-reader users
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // ==========================================
  // 6. PLANS – Monthly / Compare segmented toggle
  // ==========================================
  const plansToggle = document.querySelector('.plans-toggle');
  const planPanels = {
    'tab-cards': document.getElementById('panel-cards'),
    'tab-compare': document.getElementById('panel-compare')
  };

  if (plansToggle) {
    const tabs = Array.from(plansToggle.querySelectorAll('[role="tab"]'));

    const selectTab = (tab, focus = true) => {
      tabs.forEach((t) => {
        const isSelected = t === tab;
        t.setAttribute('aria-selected', String(isSelected));
        t.setAttribute('tabindex', isSelected ? '0' : '-1');
        const panel = planPanels[t.id];
        if (panel) panel.hidden = !isSelected;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectTab(tab, false));

      tab.addEventListener('keydown', (e) => {
        let nextIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') nextIndex = 0;
        if (e.key === 'End') nextIndex = tabs.length - 1;

        if (nextIndex !== null) {
          e.preventDefault();
          selectTab(tabs[nextIndex]);
        }
      });
    });
  }

  // ==========================================
  // 7. COVERAGE – Address availability check
  // ==========================================
  const coverageForm = document.getElementById('coverageForm');
  const addressInput = document.getElementById('addressInput');
  const coverageResult = document.getElementById('coverageResult');

  // Barangays currently served. Local only — nothing is sent anywhere.
  const SERVICE_AREAS = [
    'Sta. Cruz', 'San Vicente', 'Sambag', 'Poblacion', 'Catarman',
    'Tayud', 'Yati', 'Cogon', 'Bahak',
    'Poblacion Oriental', 'Bamboo Hills', 'Tugbongab', 'Nangka', 'Eversley'
  ];

  const MESSENGER_URL = 'https://m.me/e.hinternetconnection';

  if (coverageForm && addressInput && coverageResult) {
    const normalize = (str) => str
      .toLowerCase()
      .replace(/[.,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Reflected user input is escaped before it goes into innerHTML
    const escapeHtml = (str) => str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const findArea = (query) => {
      const q = normalize(query);
      if (!q) return null;
      return SERVICE_AREAS.find((area) => {
        const a = normalize(area);
        return a.includes(q) || q.includes(a);
      }) || null;
    };

    coverageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const value = addressInput.value.trim();
      coverageResult.classList.remove('is-covered', 'is-pending');

      if (!value) {
        coverageResult.innerHTML =
          '<i class="fas fa-circle-exclamation" aria-hidden="true"></i>' +
          '<span>Please enter your barangay or address so we can check it.</span>';
        addressInput.focus();
        coverageResult.hidden = false;
        return;
      }

      const match = findArea(value);

      if (match) {
        coverageResult.innerHTML =
          '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
          `<span>Good news &mdash; <strong>${escapeHtml(match)}</strong> is within our fiber service area. ` +
          '<a href="' + MESSENGER_URL + '" target="_blank" rel="noopener noreferrer">Message us</a> ' +
          'to schedule your installation.</span>';
        coverageResult.classList.add('is-covered');
      } else {
        coverageResult.innerHTML =
          '<i class="fas fa-circle-info" aria-hidden="true"></i>' +
          `<span>We don&rsquo;t cover <strong>${escapeHtml(value)}</strong> yet, but we are expanding. ` +
          '<a href="' + MESSENGER_URL + '" target="_blank" rel="noopener noreferrer">Message us</a> ' +
          'and we&rsquo;ll confirm the nearest point we can serve.</span>';
        coverageResult.classList.add('is-pending');
      }

      coverageResult.hidden = false;
    });

    addressInput.addEventListener('input', () => {
      if (!coverageResult.hidden) coverageResult.hidden = true;
    });
  }

  // ==========================================
  // 8. FORM VALIDATION (apply page)
  // ==========================================
  const validateField = (field) => {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return true;

    const errorEl = formGroup.querySelector('.form-error');
    const value = field.value.trim();
    let valid = true;
    let message = '';

    if (field.hasAttribute('required') && !value) {
      valid = false;
      message = errorEl ? errorEl.dataset.required || 'This field is required.' : '';
    } else if (field.type === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        valid = false;
        message = errorEl ? errorEl.dataset.email || 'Enter a valid email address.' : '';
      }
    } else if (field.type === 'tel' && value) {
      if (!/^[+\d][\d\s()-]{6,}$/.test(value)) {
        valid = false;
        message = errorEl ? errorEl.dataset.tel || 'Enter a valid phone number.' : '';
      }
    }

    if (errorEl && message) errorEl.textContent = message;

    formGroup.classList.toggle('has-error', !valid);
    formGroup.classList.toggle('has-success', valid && value.length > 0);
    return valid;
  };

  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea')
    .forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        const formGroup = field.closest('.form-group');
        if (formGroup && formGroup.classList.contains('has-error')) validateField(field);
      });
    });

  // ==========================================
  // 9. APPLY FORM – client-side only (no network)
  // ==========================================
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = applyForm.querySelectorAll('input[required], select[required], textarea[required]');
      let allValid = true;
      let firstError = null;

      fields.forEach((field) => {
        if (!validateField(field)) {
          allValid = false;
          if (!firstError) firstError = field;
        }
      });

      if (!allValid) {
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = applyForm.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting&hellip;';
      submitBtn.disabled = true;

      // Collected for a future billing-system integration. Never sent anywhere.
      const data = Object.fromEntries(new FormData(applyForm).entries());
      console.log('📝 Application submitted:', data);

      setTimeout(() => {
        applyForm.style.display = 'none';
        const success = document.getElementById('applySuccess');
        if (success) {
          success.classList.add('is-visible');
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
        submitBtn.innerHTML = originalHtml;
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  console.log('🚀 EH CONNECT ISP – Landing Page initialized');
});
