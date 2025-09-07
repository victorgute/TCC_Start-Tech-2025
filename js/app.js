import { auth, onAuthStateChanged, handleLogout } from './auth.js';

/**
 * Função central para gerir o estado de autenticação do utilizador em todo o site.
 * Mostra/esconde botões e protege páginas que requerem login.
 */
function initializeAuthManager() {
    const logoutBtn = document.getElementById('logout-btn');
    const loginLink = document.querySelector('a.nav-link[href="/html/login.html"]');
    const profileIcon = document.querySelector('.profile-card');

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
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (profileIcon) profileIcon.style.display = 'block';

        } else {
            // Utilizador não está logado
            if (loginLink) loginLink.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (profileIcon) profileIcon.style.display = 'none';

            // Se o utilizador tentar aceder a uma página protegida, redireciona para o login
            if (protectedPages.some(page => currentPagePath.startsWith(page))) {
                window.location.href = "/html/login.html";
            }
        }
    });

    // Adiciona o evento de clique ao botão de logout, se ele existir na página
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Arranca o gestor de autenticação assim que o DOM estiver pronto.
document.addEventListener("DOMContentLoaded", () => {
    initializeAuthManager();
    console.log("Gestor de Autenticação (app.js) inicializado.");
});

