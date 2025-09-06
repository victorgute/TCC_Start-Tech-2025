import { signInWithEmail, signInWithGoogle } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const googleBtn = document.getElementById('google-login-btn');
    const errorMsg = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            const success = await signInWithEmail(emailInput.value, passwordInput.value);
            if (success) {
                // CORREÇÃO: Usar caminho absoluto
                window.location.href = '/html/ferramentas.html'; 
            } else {
                errorMsg.textContent = 'Email ou senha inválidos.';
                errorMsg.style.display = 'block';
            }
        });
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            const success = await signInWithGoogle();
            if (success) {
                // CORREÇÃO: Usar caminho absoluto
                window.location.href = '/html/ferramentas.html';
            }
        });
    }
});
