/**
 * Sathi Romania — Client-Side Behaviors
 * Handles mobile drawer, language switching, dark/light mode toggle,
 * checklists in localStorage, newsletter subscription, and privacy-friendly analytics.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initMobileNav();
  initTheme();
  initLanguageSwitch();
  initChecklists();
  initNewsletter();
  initAnalytics();
});

// ── Mobile Navigation Drawer ──────────────────────────────────────────────────
function initMobileNav() {
  var toggle = document.querySelector('.mobile-nav-toggle');
  var drawer = document.querySelector('.mobile-nav-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', function() {
    var isOpen = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  drawer.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Theme (Dark / Light Mode) ─────────────────────────────────────────────────
function getPreferredTheme() {
  var saved = null;
  try { saved = localStorage.getItem('sathi_theme'); } catch(e) {}
  if (saved === 'dark' || saved === 'light') return saved;
  var current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark' || current === 'light') return current;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  var nextTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  try { localStorage.setItem('sathi_theme', nextTheme); } catch(e) {}
  updateThemeIcon(nextTheme);

  // If rate chart is active on the page, re-render with matching palette
  if (typeof buildChart === 'function' && typeof rateData !== 'undefined' && rateData && rateData.history) {
    buildChart(rateData.history);
  }
}

function updateThemeIcon(theme) {
  var icons = document.querySelectorAll('.theme-icon');
  var btns = document.querySelectorAll('.theme-toggle-btn');
  var isDark = theme === 'dark';
  
  icons.forEach(function(icon) {
    icon.textContent = isDark ? '☀️' : '🌙';
  });
  btns.forEach(function(btn) {
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function initTheme() {
  var theme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);

  // Bind to any theme toggle buttons on the page that do not have an inline onclick handler
  var btns = document.querySelectorAll('.theme-toggle-btn');
  btns.forEach(function(btn) {
    if (!btn.getAttribute('onclick')) {
      btn.addEventListener('click', toggleTheme);
    }
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem('sathi_theme')) {
        var newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
        if (typeof buildChart === 'function' && typeof rateData !== 'undefined' && rateData && rateData.history) {
          buildChart(rateData.history);
        }
      }
    });
  }
}

// Expose functions globally for inline onclick handlers
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
window.updateThemeIcon = updateThemeIcon;

// ── Language Switch Handler (EN / NP) ─────────────────────────────────────────
function initLanguageSwitch() {
  var langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var targetLang = btn.getAttribute('data-lang') || btn.getAttribute('lang');
      if (!targetLang) return;
      try { localStorage.setItem('sathi_lang', targetLang); } catch(err) {}

      // If page supports in-place translation (e.g. widget), translate immediately
      if (typeof setLang === 'function') {
        e.preventDefault();
        setLang(targetLang);
        langButtons.forEach(function(b) {
          var bLang = b.getAttribute('data-lang') || b.getAttribute('lang');
          b.classList.toggle('active', bLang === targetLang);
        });
        return;
      }

      // If running via file:// protocol directly from desktop, adjust relative URL safely
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        var currentHref = window.location.href;
        if (targetLang === 'ne' && !currentHref.includes('/ne/')) {
          if (currentHref.endsWith('index.html')) {
            window.location.href = currentHref.replace(/index\.html$/, 'ne/index.html');
          } else {
            window.location.href = currentHref.replace(/\/?$/, '/ne/index.html');
          }
        } else if (targetLang === 'en' && currentHref.includes('/ne/')) {
          window.location.href = currentHref.replace(/\/ne\//, '/');
        }
      }
    });
  });
}

// ── Interactive Checklist with LocalStorage Persistence ────────────────────────
function initChecklists() {
  var guideSlug = document.body.dataset.slug;
  if (!guideSlug) return;

  var checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  if (checkboxes.length === 0) return;

  var storageKey = 'sathi_chk_' + guideSlug;
  var saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (e) {
    saved = {};
  }

  checkboxes.forEach(function(box, idx) {
    if (saved[idx]) {
      box.checked = true;
    }
    box.addEventListener('change', function() {
      saved[idx] = box.checked;
      try {
        localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch (e) {}
    });
  });
}

// ── Newsletter Subscription Handler ───────────────────────────────────────────
function initNewsletter() {
  var forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(function(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var emailInput = form.querySelector('.newsletter-input');
      var consentBox = form.querySelector('.newsletter-consent input');
      var statusBox = form.querySelector('.newsletter-status');
      var btn = form.querySelector('button[type="submit"]');

      if (!emailInput || !emailInput.value.includes('@') || (consentBox && !consentBox.checked)) {
        if (statusBox) {
          statusBox.textContent = form.dataset.errInvalid || 'Please provide a valid email and check the consent box.';
          statusBox.className = 'newsletter-status error';
        }
        return;
      }

      var endpoint = window.__NEWSLETTER_ENDPOINT__ || form.action || '';
      var origBtnText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '...';
      }

      try {
        if (endpoint && endpoint !== '#' && !endpoint.includes('example.com')) {
          var res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailInput.value.trim(),
              consent: true,
              lang: document.documentElement.lang || 'en',
              source: window.location.pathname
            })
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
        } else {
          // Simulated delay for local testing
          await new Promise(function(resolve) { setTimeout(resolve, 600); });
        }

        if (statusBox) {
          statusBox.textContent = form.dataset.msgSuccess || 'Thank you! You have been subscribed for email updates.';
          statusBox.className = 'newsletter-status success';
        }
        emailInput.value = '';
        if (consentBox) consentBox.checked = false;
      } catch (err) {
        if (statusBox) {
          statusBox.textContent = 'Network error while subscribing. Please try again.';
          statusBox.className = 'newsletter-status error';
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = origBtnText;
        }
      }
    });
  });
}

// ── Privacy-Friendly Analytics (Plausible / Umami) ───────────────────────────
function initAnalytics() {
  if (!window.__SATHI_ANALYTICS_CONFIG__) return;
  var cfg = window.__SATHI_ANALYTICS_CONFIG__;
  if (!cfg.enabled || !cfg.domain) return;

  var script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', cfg.domain);
  script.src = cfg.src || 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}
