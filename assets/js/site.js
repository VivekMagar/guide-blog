/**
 * Sathi Romania (साथी रोमानिया) — Client-Side Behaviors
 * Warm, accessible, mobile-first companion script.
 * Handles mobile drawer, thumb navigation bar, quick converter presets,
 * language switching, dark/light mode toggle, checklists with localStorage,
 * newsletter subscription, and analytics.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initMobileNav();
  initMobileBottomNav();
  initTheme();
  initLanguageSwitch();
  initChecklists();
  initQuickPresets();
  initNewsletter();
  initAnalytics();
});

// ── Mobile Sticky Bottom Action Bar (Thumb Navigation) ────────────────────────
function initMobileBottomNav() {
  if (document.querySelector('.sathi-bottom-bar')) return;

  var path = window.location.pathname.toLowerCase();
  var isNepali = path.indexOf('/ne/') !== -1 || document.documentElement.lang === 'ne';

  // Base URLs
  var homeUrl = isNepali ? '/ne/' : '/';
  var startUrl = isNepali ? '/ne/start-here/' : '/start-here/';
  var sendUrl = isNepali ? '/ne/send-money/' : '/send-money/';
  var blogUrl = isNepali ? '/ne/blog/' : '/blog/';
  var communityUrl = isNepali ? '/ne/community/' : '/community/';

  // Tab labels
  var labels = isNepali ? {
    home: 'गृह',
    start: 'सुरुवात',
    send: 'पैसा',
    guides: 'गाइड',
    help: 'मद्दत'
  } : {
    home: 'Home',
    start: 'Start',
    send: 'Send',
    guides: 'Guides',
    help: 'Help'
  };

  // Determine active tab
  var isHome = path === '/' || path === '/index.html' || path === '/ne/' || path === '/ne/index.html';
  var isStart = path.indexOf('/start-here') !== -1;
  var isSend = path.indexOf('/send-money') !== -1;
  var isBlog = path.indexOf('/blog') !== -1 || path.indexOf('/guides/') !== -1;
  var isCommunity = path.indexOf('/community') !== -1;

  var bar = document.createElement('nav');
  bar.className = 'sathi-bottom-bar';
  bar.setAttribute('aria-label', isNepali ? 'द्रुत मोबाइल नेभिगेसन' : 'Quick Mobile Navigation');

  bar.innerHTML = [
    '<a href="' + homeUrl + '" class="sathi-bottom-tab' + (isHome ? ' active' : '') + '">',
    '  <span class="tab-icon">🏠</span>',
    '  <span>' + labels.home + '</span>',
    '</a>',
    '<a href="' + startUrl + '" class="sathi-bottom-tab' + (isStart ? ' active' : '') + '">',
    '  <span class="tab-icon">🧳</span>',
    '  <span>' + labels.start + '</span>',
    '</a>',
    '<a href="' + sendUrl + '" class="sathi-bottom-tab' + (isSend ? ' active' : '') + '">',
    '  <span class="tab-icon">💸</span>',
    '  <span>' + labels.send + '</span>',
    '</a>',
    '<a href="' + blogUrl + '" class="sathi-bottom-tab' + (isBlog ? ' active' : '') + '">',
    '  <span class="tab-icon">📖</span>',
    '  <span>' + labels.guides + '</span>',
    '</a>',
    '<a href="' + communityUrl + '" class="sathi-bottom-tab' + (isCommunity ? ' active' : '') + '">',
    '  <span class="tab-icon">🆘</span>',
    '  <span>' + labels.help + '</span>',
    '</a>'
  ].join('\n');

  document.body.appendChild(bar);
}

// ── Quick Converter Presets ───────────────────────────────────────────────────
function initQuickPresets() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.quick-preset-btn');
    if (!btn) return;
    
    var val = btn.getAttribute('data-val') || btn.textContent.replace(/[^0-9]/g, '');
    if (!val) return;

    // Check for homepage calc input or comparison amount input
    var targetInput = document.getElementById('home-calc-ron') ||
                      document.getElementById('cmp-amount') ||
                      document.getElementById('conv-input-ron');

    if (targetInput) {
      targetInput.value = val;
      // Trigger native input event so calculators update automatically
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Highlight active preset button
      var parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('.quick-preset-btn').forEach(function(b) {
          b.style.background = '';
          b.style.color = '';
        });
        btn.style.background = 'var(--accent)';
        btn.style.color = '#ffffff';
      }
    }
  });
}

// ── Mobile Navigation Drawer ──────────────────────────────────────────────────
function initMobileNav() {
  var toggle = document.querySelector('.mobile-nav-toggle');
  var drawer = document.querySelector('.mobile-nav-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', function() {
    var isOpen = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  drawer.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
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

  function updateItemState(box) {
    var item = box.closest('.checklist-item');
    if (!item) return;
    if (box.checked) {
      item.style.borderColor = 'var(--up-border)';
      item.style.background = 'var(--up-light)';
    } else {
      item.style.borderColor = '';
      item.style.background = '';
    }
  }

  checkboxes.forEach(function(box, idx) {
    if (saved[idx]) {
      box.checked = true;
      updateItemState(box);
    }
    box.addEventListener('change', function() {
      saved[idx] = box.checked;
      updateItemState(box);
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
          await new Promise(function(resolve) { setTimeout(resolve, 500); });
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
