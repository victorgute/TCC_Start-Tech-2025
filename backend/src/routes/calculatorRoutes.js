import express from 'express';
import { addCalculatorData, getUserCalculatorData } from '../services/dynamodb_connection.js';

const router = express.Router();

// Rota GET corrigida para buscar dados de um workspace específico
router.get('/', async (req, res) => {
    const userId = req.user?.uid;
    const { workspaceId } = req.query; // Pega o ID do workspace da URL (query parameter)
    
    if (!userId) {
        return res.status(401).send({ message: 'Não autorizado.' });
    }
    if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID é obrigatório.' });
    }

    try {
        const items = await getUserCalculatorData(userId, workspaceId);
        res.status(200).json(items);
    } catch (error) {
        console.error("Erro na rota GET /api/calculator:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao obter os dados.' });
    }
});

// Rota POST corrigida para salvar dados num workspace específico
router.post('/', async (req, res) => {
    const userId = req.user?.uid;
    const { workspaceId, calculatorType, year, month, data } = req.body;
    
    if (!userId) {
        return res.status(401).send({ message: 'Não autorizado.' });
    }
    if (!workspaceId || !calculatorType || !year || !month || !data) {
        return res.status(400).send({ message: 'Dados incompletos.' });
    }

    try {
        await addCalculatorData(userId, workspaceId, calculatorType, year, month, data);
        res.status(201).send({ message: 'Dados da calculadora guardados com sucesso!' });
    } catch (error) {
        console.error("Erro na rota POST /api/calculator:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao guardar os dados.' });
    }
});

export default router;