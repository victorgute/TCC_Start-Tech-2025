import express from 'express';
import cors from 'cors';
import path from 'path'; // ---> MÓDULO NECESSÁRIO PARA CAMINHOS
import { fileURLToPath } from 'url'; // ---> MÓDULO NECESSÁRIO PARA CAMINHOS
import profileRoutes from './src/routes/profileRoutes.js';
import workspacesRoutes from './src/routes/workspacesRoutes.js';
import goalsRoutes from './src/routes/goalsRoutes.js';
import { loadConfig } from './config.js';
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { firebaseAuthMiddleware, initializeFirebase } from './src/middleware/authMiddleware.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---> LÓGICA PARA ENCONTRAR O CAMINHO CORRETO DOS ARQUIVOS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('A aguardar 3 segundos para a inicialização dos serviços da AWS...');
      await delay(3000); 
    }

    const config = await loadConfig();
    console.log('Configuração carregada com sucesso.');

    initializeDbConnection(config);
    initializeFirebase(config.FIREBASE_SERVICE_ACCOUNT);

    const app = express();
    app.use(cors());
    app.use(express.json());

    // ---> LINHAS NOVAS: SERVIR OS ARQUIVOS ESTÁTICOS DO FRONT-END
    // Aponta para a pasta 'dist' que o 'npm run build' cria
    const frontendDistPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendDistPath));

    // ---> ROTAS DA API (DEVEM VIR DEPOIS DE SERVIR OS ARQUIVOS ESTÁTICOS)
    app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
    app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);
    app.use('/api/profile', firebaseAuthMiddleware, profileRoutes);
    app.use('/api/workspaces', firebaseAuthMiddleware, workspacesRoutes);
    app.use('/api/workspaces', firebaseAuthMiddleware, workspacesRoutes);
    app.use('/api/goals', firebaseAuthMiddleware, goalsRoutes);

    // ---> ROTA FINAL: Se nenhum arquivo estático ou rota de API corresponder, envia o index.html
    // Isso é crucial para que o roteamento do front-end (ex: ir para /html/ferramentas.html) funcione.
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor EcoManager (API e Frontend) a correr na porta ${PORT}`);
    });

  } catch (error) {
    console.error("Falha fatal ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();