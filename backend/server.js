// backend/server.js

import express from 'express';
import cors from 'cors';
import { loadConfig } from './config.js';
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { firebaseAuthMiddleware, initializeFirebase } from './src/middleware/authMiddleware.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';

// ----> CÓDIGO NOVO A ADICIONAR <----
// Função para criar uma pausa
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// ----> FIM DO CÓDIGO NOVO <----

async function startServer() {
  try {
    // ----> CÓDIGO NOVO A ADICIONAR <----
    // Em produção, aguarda 3 segundos para garantir que a IAM Role está pronta
    if (process.env.NODE_ENV === 'production') {
      console.log('A aguardar 3 segundos para a inicialização dos serviços da AWS...');
      await delay(3000); 
    }
    // ----> FIM DO CÓDIGO NOVO <----

    const config = await loadConfig();
    console.log('Configuração carregada com sucesso.');

    initializeDbConnection(config);
    initializeFirebase(config);

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
    app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);

    app.get('/', (req, res) => {
      res.status(200).send('Servidor EcoManager está saudável e a funcionar!');
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor EcoManager a correr na porta ${PORT}`);
    });

  } catch (error) {
    console.error("Falha fatal ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();