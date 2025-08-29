document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração do Firebase ---
    const firebaseConfig = {
      apiKey: "AIzaSyD1OyAxSZWLQq_uaMQJzFxxactW-sMLZ4M",
      authDomain: "ecomanager-tcc.firebaseapp.com",
      projectId: "ecomanager-tcc",
      storageBucket: "ecomanager-tcc.appspot.com",
      messagingSenderId: "807838989383",
      appId: "1:807838989383:web:21327d954d978d3f498562",
      measurementId: "G-6TTFT5PVCX"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    
    // Elementos do DOM
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const githubLoginBtn = document.getElementById('github-login-btn');
    const errorMessage = document.getElementById('error-message');

    // NOVO: Verifica se o utilizador veio da página de registo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'signup_success') {
        const loginBox = document.querySelector('.login-box');
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Conta criada com sucesso! Por favor, faça login.';
        // Insere a mensagem antes do formulário
        loginBox.insertBefore(successMessage, loginForm);
    }
    
    // Provedores
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const githubProvider = new firebase.auth.GithubAuthProvider();

    // --- Lógica de Login com Email/Senha ---
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                errorMessage.textContent = 'Email ou senha inválidos.';
                errorMessage.style.display = 'block';
            });
    });

    // --- Lógica de Login com Provedores (Google/GitHub) ---
    const handleProviderLogin = (provider) => {
        auth.signInWithPopup(provider)
            .then((result) => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                errorMessage.textContent = `Falha ao autenticar. Tente novamente.`;
                errorMessage.style.display = 'block';
            });
    };

    googleLoginBtn.addEventListener('click', () => handleProviderLogin(googleProvider));
    githubLoginBtn.addEventListener('click', () => handleProviderLogin(githubProvider));
});
