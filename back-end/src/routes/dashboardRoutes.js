import express from 'express';
import { Parser } from 'json2csv';
import { getUserCalculatorData, saveDashboardConfig, getDashboardConfig } from '../services/dynamodb_connection.js';

const router = express.Router();

/**
 * Rota para GUARDAR/ATUALIZAR a configuração do dashboard de um utilizador.
 * Método: POST
 * Endpoint: /api/dashboard/config
 * Corpo (Body) esperado: { "config": { ... } } // Um objeto JSON com as configurações
 */
router.post('/config', async (req, res) => {
    const userId = req.user?.uid;
    const { config } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }
    if (!config || typeof config !== 'object') {
        return res.status(400).json({ message: 'Objeto de configuração em falta ou mal formatado.' });
    }

    try {
        await saveDashboardConfig(userId, config);
        res.status(200).json({ message: 'Configuração do dashboard guardada com sucesso!' });
    } catch (error) {
        console.error("Erro ao guardar configuração do dashboard:", error);
        res.status(500).json({ message: 'Erro no servidor ao guardar a configuração.' });
    }
});

/**
 * Rota para OBTER a configuração do dashboard de um utilizador.
 * Método: GET
 * Endpoint: /api/dashboard/config
 */
router.get('/config', async (req, res) => {
    const userId = req.user?.uid;

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }

    try {
        const config = await getDashboardConfig(userId);
        res.status(200).json(config);
    } catch (error) {
        console.error("Erro ao obter configuração do dashboard:", error);
        res.status(500).json({ message: 'Erro no servidor ao obter a configuração.' });
    }
});


/**
 * Rota para FAZER DOWNLOAD de todos os dados do utilizador em formato CSV.
 * Método: GET
 * Endpoint: /api/dashboard/download
 */
router.get('/download', async (req, res) => {
    const userId = req.user?.uid;

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }

    try {
        // 1. Obtenha todos os dados da calculadora para o utilizador
        const items = await getUserCalculatorData(userId);

        if (items.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado para fazer o download.' });
        }

        // 2. Converta os dados JSON para CSV
        // Aplanamos a estrutura para que o objeto 'data' se torne colunas no CSV
        const flattenedData = items.map(item => ({
            user_uid: item.user_uid,
            record_id: item.record_id,
            calculator_type: item.calculator_type,
            year: item.year,
            month: item.month,
            created_at: item.created_at,
            ...item.data // "Espalha" as chaves de 'data' como colunas
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(flattenedData);

        // 3. Configure os cabeçalhos para forçar o download no browser
        res.header('Content-Type', 'text/csv');
        res.attachment(`ecomanager_data_${userId}.csv`);
        
        // 4. Envie o ficheiro CSV
        res.status(200).send(csv);

    } catch (error) {
        console.error("Erro ao gerar o ficheiro de download:", error);
        res.status(500).json({ message: 'Erro no servidor ao gerar o ficheiro.' });
    }
});

export default router;
