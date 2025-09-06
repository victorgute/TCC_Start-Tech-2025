import { signUpWithEmail } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-message');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            const success = await signUpWithEmail(emailInput.value, passwordInput.value);
            if (success) {
                // CORREÇÃO: Usar caminho absoluto
                window.location.href = '/html/ferramentas.html'; 
            } else {
                errorMsg.textContent = 'Erro ao criar conta. Verifique o email ou a senha (mínimo 6 caracteres).';
                errorMsg.style.display = 'block';
            }
        });
    }
});
