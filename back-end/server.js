import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Importa a biblioteca para ler ficheiros .env

import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { firebaseAuthMiddleware, initializeFirebase } from './src/middleware/authMiddleware.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';

// --- Carregar Variáveis de Ambiente para Desenvolvimento Local ---
// Esta linha verifica se estamos a correr localmente (onde NODE_ENV não é 'production')
// e carrega as variáveis do ficheiro .env. Na sua VM, isto será ignorado.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Para a EC2, vamos ler as credenciais do Firebase a partir de um ficheiro local seguro
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

const app = express();

// --- Configuração de CORS ---
// Permite que o seu frontend (qualquer domínio, por agora) fale com esta API
app.use(cors());
app.use(express.json());

// --- Inicialização dos Serviços ---
// A instância EC2 já tem as credenciais da AWS através da sua IAM Role
initializeDbConnection(); 
initializeFirebase(serviceAccount);


// --- Rotas da Aplicação ---
app.use('/api/calculator', firebaseAuthMiddleware, calculatorRoutes);
app.use('/api/dashboard', firebaseAuthMiddleware, dashboardRoutes);

// ===============================================================
//         ROTA DE HEALTH CHECK (A PARTE MAIS IMPORTANTE)
// ===============================================================
// Esta rota responde ao "ping" do Load Balancer para dizer que a aplicação está viva.
app.get('/', (req, res) => {
  res.status(200).send('Servidor EcoManager está saudável e a funcionar!');
});
// ===============================================================


// --- Iniciar o Servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor EcoManager a correr na porta ${PORT}`);
});