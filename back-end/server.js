import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http'; // A biblioteca chave para isto funcionar
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { firebaseAuthMiddleware, initializeFirebase } from './src/middleware/authMiddleware.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';
import { loadConfig } from './src/config/config.js';

const app = express();

// --- Configuração de CORS ---
// Permite que o seu frontend (qualquer domínio, por agora) fale com esta API
app.use(cors());
app.use(express.json());

// --- Lógica de Inicialização ---
// Esta lógica garante que a conexão à BD e ao Firebase só é feita uma vez
let isInitialized = false;
const initializeApp = async () => {
    if (isInitialized) return;
    try {
        const config = await loadConfig();
        initializeFirebase(config);
        initializeDbConnection(config);
        isInitialized = true;
        console.log("Aplicação inicializada com sucesso.");
    } catch (error) {
        console.error("Falha crítica na inicialização:", error);
        throw new Error("Falha na inicialização da aplicação.");
    }
};

// Middleware que garante que a app está inicializada antes de processar um pedido
app.use(async (req, res, next) => {
    // Para o nosso teste, vamos remover a autenticação temporariamente
    // if (!isInitialized) {
    //     await initializeApp();
    // }
    next();
});

// --- Rotas da Aplicação (Com Autenticação Reativada) ---
// Vamos manter a autenticação, mas o API Gateway irá lidar com ela no futuro
app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);

// Rota de "health check" para garantir que a API está a responder
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Tratamento de erros para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// --- Exportar o Handler para o Lambda ---
// A biblioteca `serverless-http` "traduz" o seu servidor Express para um formato que o Lambda entende.
export const handler = async (event, context) => {
    if (!isInitialized) {
        await initializeApp();
    }
    const result = await serverless(app)(event, context);
    return result;
};

