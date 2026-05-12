const form = document.getElementById('adminLoginForm');
const statusEl = document.getElementById('loginStatus');
const loginBtn = document.getElementById('loginBtn');
const DEFAULT_BACKEND_ORIGIN = 'http://localhost:3000';
let backendOrigin = window.location.origin;
const IS_BACKEND_ORIGIN = window.location.origin === DEFAULT_BACKEND_ORIGIN;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ff8e8e' : '#ffca57';
}

async function resolveBackendOrigin() {
  const candidates = [window.location.origin, DEFAULT_BACKEND_ORIGIN];
  for (const origin of candidates) {
    try {
      const response = await fetch(`${origin}/api/admin/session`, { credentials: 'include' });
      if (response.ok || response.status === 401) {
        backendOrigin = origin;
        return origin;
      }
    } catch {
      // try next candidate
    }
  }
  backendOrigin = window.location.origin;
  return backendOrigin;
}

async function redirectIfLoggedIn() {
  try {
    await resolveBackendOrigin();
    if (!IS_BACKEND_ORIGIN && backendOrigin === DEFAULT_BACKEND_ORIGIN) {
      window.location.href = `${DEFAULT_BACKEND_ORIGIN}/admin-login.html`;
      return;
    }
    const response = await fetch(`${backendOrigin}/api/admin/session`, { credentials: 'include' });
    if (response.ok) {
      window.location.href = `${backendOrigin}/admin.html`;
    }
  } catch {
    // Keep user on login page if session check fails.
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginBtn.disabled = true;
  setStatus('Signing in...');

  const username = document.getElementById('username')?.value?.trim() || '';
  const password = document.getElementById('password')?.value?.trim() || '';

  try {
    await resolveBackendOrigin();
    const response = await fetch(`${backendOrigin}/api/admin/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      setStatus(err.error || 'Login failed.', true);
      return;
    }

    setStatus('Login successful. Redirecting...');
    window.location.href = `${backendOrigin}/admin.html`;
  } catch {
    setStatus('Unable to reach backend. Start app with npm start and open localhost:3000.', true);
  } finally {
    loginBtn.disabled = false;
  }
});

window.addEventListener('DOMContentLoaded', redirectIfLoggedIn);
