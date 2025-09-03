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

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // --- Lógica do Formulário de Registo ---
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Sucesso no registo
                console.log('Utilizador criado:', userCredential.user);
                // Redireciona para a página de login com uma mensagem de sucesso
                window.location.href = 'login.html?status=signup_success';
            })
            .catch((error) => {
                // Falha no registo
                console.error('Erro no registo:', error);
                let msg = 'Ocorreu um erro. Tente novamente.';
                if (error.code === 'auth/email-already-in-use') {
                    msg = 'Este email já está a ser utilizado.';
                } else if (error.code === 'auth/weak-password') {
                    msg = 'A sua senha é muito fraca. Use pelo menos 6 caracteres.';
                }
                errorMessage.textContent = msg;
                errorMessage.style.display = 'block';
            });
    });
});
