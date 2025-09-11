import express from 'express';
import cors from 'cors';

// 1. Funções de inicialização e rotas
import { loadConfig } from './config.js'; // A nossa nova função para carregar config
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { firebaseAuthMiddleware, initializeFirebase } from './src/middleware/authMiddleware.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';

// Função principal assíncrona para controlar a ordem de inicialização
async function startServer() {
  try {
    // 2. CARREGA A CONFIGURAÇÃO PRIMEIRO!
    // Esta é a etapa mais importante. Esperamos que a configuração seja carregada da AWS.
    const config = await loadConfig();
    console.log('Configuração carregada com sucesso.');

    // 3. INICIALIZA OS SERVIÇOS COM A CONFIGURAÇÃO CARREGADA
    // Agora passamos a configuração para as funções que precisam dela.
    // (Você precisará ajustar essas funções para aceitar 'config' como parâmetro)
    initializeDbConnection(config);
    initializeFirebase(config.FIREBASE_SERVICE_ACCOUNT);

    // 4. CRIA E CONFIGURA A APLICAÇÃO EXPRESS
    const app = express();
    app.use(cors());
    app.use(express.json());

    // 5. DEFINE AS ROTAS
    // O middleware de autenticação continuará a funcionar como antes
    app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
    app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);

    // Rota de Health Check para o Load Balancer
    app.get('/', (req, res) => {
      res.status(200).send('Servidor EcoManager está saudável e a funcionar!');
    });

    // 6. INICIA O SERVIDOR
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor EcoManager a correr na porta ${PORT}`);
    });

  } catch (error) {
    console.error("Falha fatal ao iniciar o servidor:", error);
    process.exit(1); // Encerra a aplicação se a inicialização falhar
  }
}

// ----> Inicia todo o processo <----
startServer();