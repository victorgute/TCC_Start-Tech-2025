// Importa o dotenv para carregar as variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; 
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js'; // Corrigido para o nome de ficheiro padronizado
import { firebaseAuthMiddleware } from './src/middleware/authMiddleware.js'; // Corrigido para a pasta correta

const app = express();

// --- Middlewares Essenciais ---
app.use(cors()); 
app.use(express.json());

// --- Rotas da Aplicação ---
// Todas as rotas agora estão protegidas pelo middleware de autenticação
app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);


// --- Iniciar o Servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor EcoManager a correr na porta ${PORT}`);
});

