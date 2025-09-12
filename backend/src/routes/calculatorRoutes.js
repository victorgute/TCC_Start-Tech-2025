import express from 'express';
import { addCalculatorData, getUserCalculatorData } from '../services/dynamodb_connection.js';

const router = express.Router();

router.post('/', async (req, res) => {
    // A MUDANÇA ESTÁ AQUI:
    // Em vez de um ID fixo, pegamos o UID do utilizador que o middleware de autenticação validou.
    const userId = req.user?.uid;
    const { calculatorType, year, month, data } = req.body;

    // Esta verificação garante que a rota só funciona se o utilizador estiver autenticado.
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
        console.error("Erro na rota POST /:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao guardar os dados.' });
    }
});

router.get('/', async (req, res) => {
    // A MESMA MUDANÇA AQUI:
    // Usamos o ID do utilizador autenticado para garantir que ele só possa ver os seus próprios dados.
    const userId = req.user?.uid;

    if (!userId) {
        return res.status(401).send({ message: 'Não autorizado. O token de utilizador é inválido ou está em falta.' });
    }

    try {
        const items = await getUserCalculatorData(userId);
        res.status(200).json(items);
    } catch (error) {
        console.error("Erro na rota GET /:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao obter os dados.' });
    }
});

export default router;

