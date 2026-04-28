// --- Theme toggle ---
(function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function applyIcon() {
    toggle.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
  }

  applyIcon();

  toggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyIcon();
  });
})();

const form = document.getElementById('login-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const errorEl = document.getElementById('error');
    errorEl.hidden = true;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        errorEl.textContent = body.error || 'Sign-in failed';
        errorEl.hidden = false;
        return;
      }
      const { token, user } = await res.json();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/dashboard.html';
    } catch (err) {
      errorEl.textContent = 'Network error';
      errorEl.hidden = false;
    }
  });
}

const usersList = document.getElementById('users');
if (usersList) {
  const welcome = document.getElementById('welcome');
  const stored = localStorage.getItem('user');
  if (stored) {
    const user = JSON.parse(stored);
    welcome.textContent = `Welcome, ${user.name}`;
  }
  fetch('/api/users')
    .then((r) => r.json())
    .then((users) => {
      usersList.innerHTML = users
        .map((u) => `<li><strong>${u.name}</strong> — ${u.email}</li>`)
        .join('');
    });
}
