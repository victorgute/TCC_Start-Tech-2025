import express from 'express';
import cors from 'cors';
import calculatorRoutes from './src/routes/calculatorRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
// O middleware de autenticação já não é importado aqui
import { initializeDbConnection } from './src/services/dynamodb_connection.js';
import { loadConfig } from './src/config/config.js';

const app = express();

app.use(cors());
app.use(express.json());

async function startServer() {
    try {
        const config = await loadConfig();
        
        // A inicialização do Firebase já não é necessária aqui para as rotas
        initializeDbConnection(config);

        // ===============================================================
        // A AUTENTICAÇÃO FOI REMOVIDA TEMPORARIAMENTE DAS ROTAS
        // ===============================================================
        app.use('/api/calculator', calculatorRoutes);
        app.use('/api/dashboard', dashboardRoutes);
        // ===============================================================
        
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

