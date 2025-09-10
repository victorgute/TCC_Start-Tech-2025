import express from 'express';
import { addCalculatorData, getUserCalculatorData } from '../services/dynamodb_connection.js';

const router = express.Router();

/**
 * Rota para ADICIONAR dados de uma calculadora.
 * Espera que o middleware de autenticação já tenha validado o utilizador.
 */
router.post('/', async (req, res) => {
    // Apanha o ID do utilizador a partir do token verificado pelo middleware
    const userId = req.user?.uid;
    const { calculatorType, year, month, data } = req.body;

    if (!userId) {
        return res.status(401).send({ message: 'Não autorizado. O token de utilizador é inválido ou está em falta.' });
    }
    if (!calculatorType || !year || !month || !data) {
        return res.status(400).send({ message: 'Dados incompletos.' });
    }

    try {
        await addCalculatorData(userId, calculatorType, year, month, data);
        res.status(201).send({ message: 'Dados da calculadora guardados com sucesso!' });
    } catch (error) {
        console.error("Erro na rota POST /api/calculator:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao guardar os dados.' });
    }
});

/**
 * Rota para OBTER todos os dados de um utilizador.
 */
router.get('/', async (req, res) => {
    const userId = req.user?.uid;

    if (!userId) {
        return res.status(401).send({ message: 'Não autorizado. O token de utilizador é inválido ou está em falta.' });
    }

    try {
        const items = await getUserCalculatorData(userId);
        res.status(200).json(items);
    } catch (error) {
        console.error("Erro na rota GET /api/calculator:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao obter os dados.' });
    }
});

export default router;

