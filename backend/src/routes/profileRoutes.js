import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

router.post('/', async (req, res) => {
    const { displayName } = req.body;
    const uid = req.user.uid; // O uid vem do middleware de autenticação

    if (!displayName) {
        return res.status(400).json({ message: 'O nome de exibição é obrigatório.' });
    }

    try {
        // Atualiza o utilizador no Firebase Authentication
        await admin.auth().updateUser(uid, {
            displayName: displayName,
        });

        // No futuro, você pode adicionar aqui a lógica para salvar
        // informações extras no DynamoDB se precisar.

        res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar o perfil no backend:", error);
        res.status(500).json({ message: 'Ocorreu um erro no servidor ao atualizar o perfil.' });
    }
});

export default router;