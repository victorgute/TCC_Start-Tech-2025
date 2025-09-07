import express from 'express';
import cors from 'cors';
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { firebaseAuthMiddleware, initializeFirebase } from './src/middleware/authMiddleware.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';
import { loadConfig } from './src/config/config.js'; // Importa o nosso novo loader

const app = express();

// --- Middlewares Essenciais ---
app.use(cors());
app.use(express.json());

/**
 * Função de arranque assíncrona para garantir que a configuração
 * é carregada ANTES de o servidor começar a aceitar pedidos.
 */
async function startServer() {
    try {
        // 1. Carrega toda a configuração da AWS de forma segura
        const config = await loadConfig();

        // 2. Inicializa os serviços com a configuração carregada do "cofre"
        initializeFirebase(config);
        initializeDbConnection(config);

        // 3. Configura as rotas da aplicação (só depois de tudo inicializado)
        app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
        app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);
        
        // Rota de "health check" para o App Runner
        app.get('/', (req, res) => {
            res.status(200).send('Servidor EcoManager está saudável e a funcionar!');
        });

        // --- Iniciar o Servidor ---
        // O App Runner injeta a variável PORT. Para desenvolvimento local, podemos usar 3001.
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor EcoManager a correr na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Falha crítica ao iniciar o servidor:", error);
        process.exit(1); // Termina o processo se a configuração falhar
    }
}

// --- Executa a função de arranque ---
startServer();
