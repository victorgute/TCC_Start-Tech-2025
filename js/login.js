document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
      apiKey: "AIzaSyD1OyAxSZWLQq_uaMQJzFxxactW-sMLZ4M",
      authDomain: "ecomanager-tcc.firebaseapp.com",
      projectId: "ecomanager-tcc",
      storageBucket: "ecomanager-tcc.appspot.com",
      messagingSenderId: "807838989383",
      appId: "1:807838989383:web:21327d954d978d3f498562",
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const githubLoginBtn = document.getElementById('github-login-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Verifica se veio da página de registo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'signup_success') {
        successMessage.textContent = 'Conta criada com sucesso! Por favor, faça login.';
        successMessage.style.display = 'block';
    }
    
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const githubProvider = new firebase.auth.GithubAuthProvider();

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => { window.location.href = 'index.html'; })
            .catch(() => {
                errorMessage.textContent = 'Email ou senha inválidos.';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            });
    });

    const handleProviderLogin = (provider) => {
        auth.signInWithPopup(provider)
            .then(() => { window.location.href = 'index.html'; })
            .catch(() => {
                errorMessage.textContent = `Falha ao autenticar. Tente novamente.`;
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            });
    };

    googleLoginBtn.addEventListener('click', () => handleProviderLogin(googleProvider));
    githubLoginBtn.addEventListener('click', () => handleProviderLogin(githubProvider));
});
