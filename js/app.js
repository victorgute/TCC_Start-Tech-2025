/**
 * Ponto de entrada principal para a lógica de dados e autenticação da aplicação.
 * Este ficheiro corre em paralelo com o `mainScript.js`.
 */
import { auth, onAuthStateChanged, handleLogout } from './auth.js';

// Função para gerir o estado de autenticação e proteger páginas
function manageAuthState() {
    const currentPagePath = window.location.pathname;
    // Páginas que necessitam de login para serem acedidas
    const protectedPages = ['/html/ferramentas.html', '/html/profile.html', '/html/esg-e-metas.html'];
    
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.querySelector('a[href="/html/login.html"].btn-navbar'); 
    const profileLink = document.querySelector('a[href="/html/profile.html"]');

    onAuthStateChanged(auth, user => {
        if (user) {
            // UTILIZADOR LOGADO
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (profileLink) profileLink.parentElement.style.display = 'block'; // Mostra o ícone de perfil
            if (loginBtn) loginBtn.style.display = 'none';

        } else {
            // UTILIZADOR NÃO LOGADO
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (profileLink) profileLink.parentElement.style.display = 'none'; // Esconde o ícone de perfil
            if (loginBtn) loginBtn.style.display = 'block';

            // Se o utilizador tentar aceder a uma página protegida, redireciona para o login
            if (protectedPages.some(page => currentPagePath.startsWith(page))) {
                // USA SEMPRE O CAMINHO ABSOLUTO PARA O LOGIN
                window.location.href = "/html/login.html";
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

