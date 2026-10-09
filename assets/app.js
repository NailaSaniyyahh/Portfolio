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
})();
