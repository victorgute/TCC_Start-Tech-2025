import express from 'express';
import { addCalculatorData, getUserCalculatorData } from '../services/dynamodb_connection.js';

const router = express.Router();
const MOCK_USER_ID_FOR_TESTING = 'TEST_USER_0123456789'; // ID de utilizador fixo para testes

router.post('/', async (req, res) => {
    // Usa o ID de utilizador fixo em vez de req.user
    const userId = MOCK_USER_ID_FOR_TESTING;
    const { calculatorType, year, month, data } = req.body;

    if (!calculatorType || !year || !month || !data) {
        return res.status(400).send({ message: 'Dados incompletos.' });
    }

    try {
        await addCalculatorData(userId, calculatorType, year, month, data);
        res.status(201).send({ message: 'Dados da calculadora guardados com sucesso!' });
    } catch (error) {
        console.error("Erro na rota POST /:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao guardar os dados.' });
    }
});

router.get('/', async (req, res) => {
    // Usa o ID de utilizador fixo em vez de req.user
    const userId = MOCK_USER_ID_FOR_TESTING;

    try {
        const items = await getUserCalculatorData(userId);
        res.status(200).json(items);
    } catch (error) {
        console.error("Erro na rota GET /:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao obter os dados.' });
    }
});

export default router;

