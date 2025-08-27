document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração do Firebase ---
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyD1OyAxSZWLQq_uaMQJzFxxactW-sMLZ4M",
      authDomain: "ecomanager-tcc.firebaseapp.com",
      projectId: "ecomanager-tcc",
      storageBucket: "ecomanager-tcc.appspot.com",
      messagingSenderId: "807838989383",
      appId: "1:807838989383:web:21327d954d978d3f498562",
      measurementId: "G-6TTFT5PVCX"
    };

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    
    // Provedores de Autenticação
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const githubProvider = new firebase.auth.GithubAuthProvider(); // Provedor do GitHub

    // --- Lógica dos Botões ---
    const googleLoginBtn = document.getElementById('google-login-btn');
    const githubLoginBtn = document.getElementById('github-login-btn'); // Botão do GitHub
    const errorMessage = document.getElementById('error-message');

    // Função genérica para fazer login
    const handleLogin = (provider) => {
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log("Usuário logado:", result.user);
                window.location.href = 'index.html'; // Redireciona para a página principal
            })
            .catch((error) => {
                console.error("Erro no login:", error);
                errorMessage.textContent = `Falha ao autenticar. Verifique a configuração do Firebase e tente novamente.`;
                errorMessage.style.display = 'block';
            });
    };

    // Adiciona os eventos de clique aos botões
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => handleLogin(googleProvider));
    }
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', () => handleLogin(githubProvider));
    }
});
