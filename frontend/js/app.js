import { auth, onAuthStateChanged, handleLogout } from './auth.js';

function initializeAuthManager() {
    const loginLink = document.querySelector('a.nav-link[href="/html/login.html"]');
    const profileIcon = document.querySelector('.profile-card');
    const avatarContainer = document.querySelector('.profile-card .avatar');

    const currentPagePath = window.location.pathname;
    const protectedPages = [
        '/html/ferramentas.html',
        '/html/profile.html',
        '/html/esg-e-metas.html'
    ];

    onAuthStateChanged(auth, user => {
        if (user) {
            // Utilizador está logado
            if (loginLink) loginLink.style.display = 'none';
            if (profileIcon) profileIcon.style.display = 'block';
            
            // --- LÓGICA DA FOTO DE PERFIL NO HEADER ---
            // Esta lógica agora está no app.js para funcionar em todas as páginas
            if (avatarContainer) {
                if (user.photoURL) {
                    // Se o utilizador tiver uma foto, mostra a imagem
                    avatarContainer.innerHTML = `<a href="/html/profile.html"><img src="${user.photoURL}" alt="Foto de Perfil" class="header-avatar"></a>`;
                } else {
                    // Se não, mostra o ícone padrão
                    avatarContainer.innerHTML = `<a href="/html/profile.html"><i class="fas fa-user"></i></a>`;
                }
            }

        } else {
            // Utilizador não está logado
            if (loginLink) loginLink.style.display = 'block';
            if (profileIcon) profileIcon.style.display = 'none';

            if (protectedPages.some(page => currentPagePath.includes(page))) {
                window.location.href = "/html/login.html";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeAuthManager();
    console.log("Gestor de Autenticação (app.js) inicializado.");
});