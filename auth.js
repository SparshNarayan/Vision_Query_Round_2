/**
 * VisionQuery Authentication Logic
 */

/* ================= TAB SWITCH ================= */

function switchTab(tab) {
    document.getElementById('errorMessage').style.display = 'none';

    document.getElementById('loginTab').classList.toggle('active', tab === 'login');
    document.getElementById('registerTab').classList.toggle('active', tab === 'register');

    document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
}

/* ================= ERROR ================= */

function showError(msg) {
    const e = document.getElementById('errorMessage');
    e.textContent = msg;
    e.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

/* ================= LOADING ================= */

function setLoading(formId, loading) {
    const btn = document.querySelector(`#${formId} button`);
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : btn.dataset.text;
}

/* ================= LOGIN ================= */

async function handleLogin(e) {
    e.preventDefault();
    hideError();

    const u = loginUsername.value.trim();
    const p = loginPassword.value;

    if (!u || !p) return showError('All fields required');

    setLoading('loginForm', true);

    try {
        const res = await api.login(u, p);
        setToken(res.access_token);
        window.location.href = 'dashboard.html';
    } catch (err) {
        showError(err.detail || 'Login failed');
    } finally {
        setLoading('loginForm', false);
    }
}

/* ================= REGISTER ================= */

async function handleRegister(e) {
    e.preventDefault();
    hideError();

    const u = registerUsername.value.trim();
    const eMail = registerEmail.value.trim();
    const p = registerPassword.value;

    if (!u || !eMail || !p) return showError('All fields required');

    try {
        setLoading('registerForm', true);
        await api.register({ username: u, email: eMail, password: p });
        showError('Registration successful! Login now.');
        setTimeout(() => switchTab('login'), 1200);
    } catch (err) {
        showError(err.detail || 'Registration failed');
    } finally {
        setLoading('registerForm', false);
    }
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', () => {
    loginForm.querySelector('button').dataset.text = 'Login';
    registerForm.querySelector('button').dataset.text = 'Register';

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    switchTab('login');
});
