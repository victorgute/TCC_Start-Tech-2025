import express from 'express';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/dynamodb_connection.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const goals = await getGoals(req.user.uid);
        res.status(200).json(goals);
    } catch (error) { res.status(500).json({ message: 'Erro ao buscar metas.' }); }
});

router.post('/', async (req, res) => {
    try {
        const newGoal = await createGoal(req.user.uid, req.body);
        res.status(201).json(newGoal);
    } catch (error) { res.status(500).json({ message: 'Erro ao criar meta.' }); }
});

router.put('/:recordId', async (req, res) => {
    try {
        const updatedGoal = await updateGoal(req.user.uid, req.params.recordId, req.body);
        res.status(200).json(updatedGoal);
    } catch (error) { res.status(500).json({ message: 'Erro ao atualizar meta.' }); }
});

router.delete('/:recordId', async (req, res) => {
    try {
        await deleteGoal(req.user.uid, req.params.recordId);
        res.status(200).json({ message: 'Meta apagada com sucesso.' });
    } catch (error) { res.status(500).json({ message: 'Erro ao apagar meta.' }); }
});

export default router;