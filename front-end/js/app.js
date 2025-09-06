/**
 * Ponto de entrada principal para a lógica de dados e autenticação da aplicação.
 * Este ficheiro corre em paralelo com o `mainScript.js`.
 */
import { auth, onAuthStateChanged, handleLogout } from './auth.js';

// Função para gerir o estado de autenticação e proteger páginas
function manageAuthState() {
    const currentPagePath = window.location.pathname;
    const protectedPages = ['ferramentas.html', 'profile.html', 'esg-e-metas.html'];
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.querySelector('a[href*="login.html"].btn-navbar'); // Botão de login se existir

    onAuthStateChanged(auth, user => {
        if (user) {
            // UTILIZADOR LOGADO
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
        } else {
            // UTILIZADOR NÃO LOGADO
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';

            // Se o utilizador tentar aceder a uma página protegida, redireciona para o login
            if (protectedPages.some(page => currentPagePath.includes(page))) {
                // Ajusta o caminho de redirecionamento dependendo se está na raiz ou numa subpasta
                const loginPath = currentPagePath.includes('/html/') ? '../login.html' : './html/login.html';
                window.location.href = loginPath;
            }
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Inicializa a lógica de autenticação assim que o DOM estiver pronto.
document.addEventListener("DOMContentLoaded", () => {
    manageAuthState();
    console.log("App.js (Lógica de Dados) inicializado.");
});

