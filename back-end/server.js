import express from 'express';
import cors from 'cors';
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { initializeDbConnection } from './src/services/dynamodb_connection.js';
import { loadConfig } from './src/config/config.js';

const app = express();

// ===============================================================
//         CONFIGURAÇÃO DE CORS (A PARTE MAIS IMPORTANTE)
// ===============================================================

// Substitua pelo URL exato do seu site no CloudFront
const FRONTEND_URL = 'https://dch65665lgwqj.cloudfront.net'; 

const corsOptions = {
  origin: FRONTEND_URL,
  optionsSuccessStatus: 200 // para navegadores mais antigos
};

// Use as opções de CORS
app.use(cors(corsOptions));
// ===============================================================

app.use(express.json());

async function startServer() {
    try {
        const config = await loadConfig();
        initializeDbConnection(config);

        // Rotas sem autenticação para o teste
        app.use('/api/calculator', calculatorRoutes);
        app.use('/api/dashboard', dashboardRoutes);
        
        app.get('/', (req, res) => {
            res.status(200).send('Servidor EcoManager está saudável e a funcionar! (Modo de Teste Sem Autenticação)');
        });

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor EcoManager a correr na porta ${PORT} (Modo de Teste Sem Autenticação)`);
        });

    } catch (error) {
        console.error("Falha crítica ao iniciar o servidor:", error);
        process.exit(1);
    }
}

startServer();

