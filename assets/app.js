/**
 * Trace Developer - Core UI Interactions & Micro-Interactions
 * Clean, lightweight Vanilla JavaScript for navigation, active scrollspy, and clipboard utilities.
 */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // --- Mobile Navigation Drawer ---
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  function closeMenu() {
    if (nav?.classList.contains('open')) {
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  }

  function openMenu() {
    nav?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
  }

  toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.contains('open');
    if (isOpen) closeMenu();
    else openMenu();
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      closeMenu();
      toggle?.focus();
    }
  });

  // --- Print Résumé Handler ---
  const printButton = document.querySelector('[data-print]');
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', () => window.print());
  }

  // --- Active Nav Link Scrollspy ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav a[href*="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href && href.includes('#' + id)) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // --- Copy to Clipboard Utility ---
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('[data-copy-target]');
    if (!copyBtn) return;

    const targetSelector = copyBtn.getAttribute('data-copy-target');
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const textToCopy = targetEl.innerText || targetEl.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '✓ Copied!';

      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(() => {});
  });

  // --- Copy Email Button (for Contact section) ---
  const emailCopyBtn = document.querySelector('[data-copy-email]');
  if (emailCopyBtn) {
    emailCopyBtn.addEventListener('click', () => {
      const email = emailCopyBtn.getAttribute('data-copy-email');
      if (!email) return;
      navigator.clipboard.writeText(email).then(() => {
        const originalText = emailCopyBtn.innerText;
        emailCopyBtn.innerText = 'Copied to clipboard!';
        setTimeout(() => {
          emailCopyBtn.innerText = originalText;
        }, 2000);
      });
    });
  }

  // --- Projects Slider Interaction (Drag, Swipe, Navigation & Bullets) ---
  function initProjectsSlider() {
    const projectsTrack = document.querySelector('#projects-track');
    if (!projectsTrack || projectsTrack.dataset.sliderReady === 'true') return;
    projectsTrack.dataset.sliderReady = 'true';

    const projectBullets = Array.from(document.querySelectorAll('#projects-pagination .pagination-bullet'));
    const prevBtn = document.querySelector('#projects-prev-btn');
    const nextBtn = document.querySelector('#projects-next-btn');
    const cards = Array.from(projectsTrack.querySelectorAll('.project-item-card'));

    if (!cards.length) return;

    let currentSlideIndex = 0;

    function getTotalSlides() {
      return projectBullets.length ? projectBullets.length : Math.max(1, Math.ceil(cards.length / 2));
    }

    function getCardIndexForSlide(slideIdx) {
      return slideIdx * 2;
    }

    function updateBullets(activeIndex) {
      projectBullets.forEach((bullet, idx) => {
        const slideAttr = bullet.getAttribute('data-slide');
        const slideIdx = slideAttr !== null ? parseInt(slideAttr, 10) : idx;
        const isActive = (slideIdx === activeIndex) || (idx === activeIndex);
        bullet.classList.toggle('active', isActive);
        bullet.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    function goToSlide(slideIndex) {
      const totalSlides = getTotalSlides();
      let targetSlide = slideIndex;
      if (targetSlide >= totalSlides) targetSlide = 0;
      if (targetSlide < 0) targetSlide = totalSlides - 1;

      currentSlideIndex = targetSlide;
      updateBullets(currentSlideIndex);

      const cardIdx = getCardIndexForSlide(targetSlide);
      const targetCard = cards[cardIdx] || cards[0];

      if (targetCard) {
        const trackRect = projectsTrack.getBoundingClientRect();
        const cardRect = targetCard.getBoundingClientRect();
        const targetScrollLeft = projectsTrack.scrollLeft + (cardRect.left - trackRect.left);

        projectsTrack.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }

    // Bullet clicks
    projectBullets.forEach((bullet, idx) => {
      bullet.addEventListener('click', (e) => {
        e.preventDefault();
        const slideAttr = bullet.getAttribute('data-slide');
        const slideIdx = slideAttr !== null ? parseInt(slideAttr, 10) : idx;
        goToSlide(isNaN(slideIdx) ? idx : slideIdx);
      });
    });

    // Arrow buttons with wrap-around
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentSlideIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentSlideIndex + 1);
      });
    }

    // Synchronize active bullet on scroll / swipe
    let scrollTimeout;
    projectsTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const maxScroll = projectsTrack.scrollWidth - projectsTrack.clientWidth;
        if (maxScroll <= 5) return;

        // End-boundary check: activate last bullet when reaching end of track
        if (projectsTrack.scrollLeft >= maxScroll - 35) {
          currentSlideIndex = projectBullets.length ? projectBullets.length - 1 : 4;
          updateBullets(currentSlideIndex);
          return;
        }

        // Start-boundary check
        if (projectsTrack.scrollLeft <= 25) {
          currentSlideIndex = 0;
          updateBullets(currentSlideIndex);
          return;
        }

        const trackRect = projectsTrack.getBoundingClientRect();
        let closestCardIdx = 0;
        let minDiff = Infinity;

        cards.forEach((card, idx) => {
          const cardRect = card.getBoundingClientRect();
          const diff = Math.abs(cardRect.left - trackRect.left);
          if (diff < minDiff) {
            minDiff = diff;
            closestCardIdx = idx;
          }
        });

        const calculatedSlide = Math.floor(closestCardIdx / 2);
        const maxBulletIdx = projectBullets.length ? projectBullets.length - 1 : 4;
        currentSlideIndex = Math.max(0, Math.min(maxBulletIdx, calculatedSlide));
        updateBullets(currentSlideIndex);
      }, 40);
    }, { passive: true });

    // Mouse drag-to-scroll (desktop swipe)
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hasDragged = false;

    projectsTrack.addEventListener('mousedown', (e) => {
      if (e.target.closest('a, button')) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX - projectsTrack.offsetLeft;
      startScrollLeft = projectsTrack.scrollLeft;
      projectsTrack.classList.add('is-dragging');
    });

    const stopDragging = () => {
      if (!isDown) return;
      isDown = false;
      projectsTrack.classList.remove('is-dragging');
    };

    window.addEventListener('mouseup', stopDragging);
    projectsTrack.addEventListener('mouseleave', stopDragging);

    projectsTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - projectsTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) {
        hasDragged = true;
      }
      projectsTrack.scrollLeft = startScrollLeft - walk;
    });

    // Prevent accidental click during drag
    projectsTrack.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    }, true);
  }

  // --- Skills Category Filter Tabs ---
  function initSkillsFilter() {
    const tabs = document.querySelectorAll('.skill-tab-btn');
    const cards = document.querySelectorAll('#skills-grid .skill-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        cards.forEach((card) => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  function initApp() {
    initProjectsSlider();
    initSkillsFilter();
  }

  // Initialize immediately and on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Also expose to window for direct calls
  window.initProjectsSlider = initProjectsSlider;
  window.initSkillsFilter = initSkillsFilter;
})();

