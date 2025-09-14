import express from 'express';
import { getWorkspaces, createWorkspace } from '../services/dynamodb_connection.js';

const router = express.Router();

// Rota para listar os workspaces do utilizador
router.get('/', async (req, res) => {
    try {
        const workspaces = await getWorkspaces(req.user.uid);
        res.status(200).json(workspaces);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar workspaces.' });
    }
});

// Rota para criar um novo workspace
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'O nome do workspace é obrigatório.' });
    }
    try {
        const newWorkspace = await createWorkspace(req.user.uid, name);
        res.status(201).json(newWorkspace);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar workspace.' });
    }
});

export default router;