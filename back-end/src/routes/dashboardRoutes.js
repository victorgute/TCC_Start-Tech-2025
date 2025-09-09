import express from 'express';
import { Parser } from 'json2csv';
import { getUserCalculatorData, saveDashboardConfig, getDashboardConfig } from '../services/dynamodb_connection.js';

const router = express.Router();
const MOCK_USER_ID_FOR_TESTING = 'TEST_USER_0123456789'; // ID de utilizador fixo para testes

router.post('/config', async (req, res) => {
    const userId = MOCK_USER_ID_FOR_TESTING;
    const { config } = req.body;

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

router.get('/config', async (req, res) => {
    const userId = MOCK_USER_ID_FOR_TESTING;

    try {
        const config = await getDashboardConfig(userId);
        res.status(200).json(config);
    } catch (error) {
        console.error("Erro ao obter configuração do dashboard:", error);
        res.status(500).json({ message: 'Erro no servidor ao obter a configuração.' });
    }
});


router.get('/download', async (req, res) => {
    const userId = MOCK_USER_ID_FOR_TESTING;

    try {
        const items = await getUserCalculatorData(userId);
        if (items.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado para fazer o download.' });
        }
        const flattenedData = items.map(item => ({
            user_uid: item.user_uid,
            record_id: item.record_id,
            calculator_type: item.calculator_type,
            year: item.year,
            month: item.month,
            created_at: item.created_at,
            ...item.data
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(flattenedData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`ecomanager_data_test.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error("Erro ao gerar o ficheiro de download:", error);
        res.status(500).json({ message: 'Erro no servidor ao gerar o ficheiro.' });
    }
});

export default router;
