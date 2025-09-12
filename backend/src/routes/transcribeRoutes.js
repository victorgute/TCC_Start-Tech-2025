// backend/src/routes/transcribeRoutes.js
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { loadConfig } from '../../config.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum ficheiro de áudio enviado.' });
        }

        const config = await loadConfig();
        const apiKey = config.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('Chave da API da OpenAI não encontrada na configuração.');
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: 'recording.webm', contentType: req.file.mimetype });
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');

        const openaiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            throw new Error(`Erro da API da OpenAI: ${errorData.error.message}`);
        }

        const data = await openaiResponse.json();
        res.json(data); // Envia o texto transcrito de volta para o front-end

    } catch (error) {
        console.error('Erro na rota de transcrição:', error);
        res.status(500).json({ message: 'Ocorreu um erro no servidor ao transcrever o áudio.' });
    }
});

export default router;