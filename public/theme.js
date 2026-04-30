// Theme management: applies the saved theme before first paint to prevent FOUC,
// then wires up the header toggle once the DOM is ready.
(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function storedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function resolveInitialTheme() {
    return storedTheme() || (systemPrefersDark() ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  // Apply immediately (script is in <head>, before <body> paints).
  applyTheme(resolveInitialTheme());

  function setTheme(theme, persist) {
    applyTheme(theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (_) {
        /* ignore storage errors */
      }
    }
    syncToggle();
  }

  function syncToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var isDark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
    btn.textContent = isDark ? '☀️' : '🌙';
  }

  function init() {
    syncToggle();
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next, true);
      });
    }

    // Track system changes only while the user has no explicit preference.
    if (window.matchMedia) {
      var mql = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        if (storedTheme()) return;
        setTheme(e.matches ? 'dark' : 'light', false);
      };
      if (mql.addEventListener) mql.addEventListener('change', onChange);
      else if (mql.addListener) mql.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
