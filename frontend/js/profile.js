import { onAuthStateChanged, auth, updateProfile, handleLogout } from './auth.js'; // <-- 'handleLogout' ADICIONADO AQUI
import { updateUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os elementos da página
    const nomeDisplay = document.getElementById('profile-greeting');
    const emailInput = document.getElementById('profile-email');
    const nomeInput = document.getElementById('profile-name');
    const profilePicture = document.getElementById('profile-picture');
    const profileForm = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('logout-btn');
    const notificationMessage = document.getElementById('notification-message');
    const submitButton = profileForm ? profileForm.querySelector('button[type="submit"]') : null;
    const buttonText = submitButton ? submitButton.querySelector('.btn-text') : null;
    const spinner = submitButton ? submitButton.querySelector('.spinner') : null;

    // Fica a "ouvir" por mudanças no estado de autenticação
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Se o utilizador está logado, preenche todos os campos
            if (nomeDisplay) nomeDisplay.textContent = `Olá, ${user.displayName || 'Utilizador'}!`;
            if (emailInput) emailInput.value = user.email || '';
            if (nomeInput) nomeInput.value = user.displayName || '';
            if (profilePicture) profilePicture.src = user.photoURL || '../img/default-avatar.png';
        } else {
            // Se não está logado, redireciona para a página de login
            window.location.href = '/html/login.html';
        }
    });

    // Adiciona a funcionalidade ao botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Adiciona o listener de evento para o formulário
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = nomeInput.value.trim();

            if (!newName || newName === auth.currentUser.displayName) {
                showNotification('Nenhuma alteração para salvar.', 'info');
                return;
            }

            setLoading(true);

            try {
                // Atualiza o perfil no Firebase e no nosso backend
                await updateProfile(auth.currentUser, { displayName: newName });
                await updateUserProfile({ displayName: newName });
                
                if (nomeDisplay) nomeDisplay.textContent = `Olá, ${newName}!`;
                showNotification('Perfil atualizado com sucesso!', 'success');

            } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                showNotification('Ocorreu um erro ao salvar.', 'error');
            } finally {
                setLoading(false);
            }
        });
    }
    
    // Função para gerir o estado de carregamento do botão
    function setLoading(isLoading) {
        if (!submitButton) return;
        submitButton.disabled = isLoading;
        if (buttonText) buttonText.style.display = isLoading ? 'none' : 'inline';
        if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    
    // Função para mostrar notificações
    function showNotification(message, type = 'success') {
        if (!notificationMessage) return;
        notificationMessage.textContent = message;
        notificationMessage.className = `notification ${type}`;
        notificationMessage.style.display = 'block';
        setTimeout(() => {
            notificationMessage.style.display = 'none';
        }, 4000);
    }
});