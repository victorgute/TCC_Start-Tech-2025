import express from 'express';
import { addCalculatorData, getUserCalculatorData } from '../services/dynamodb_connection.js';

const router = express.Router();

/**
 * Rota para ADICIONAR dados de uma calculadora com validação.
 * Método: POST
 * Endpoint: /api/calculator/
 */
router.post('/', async (req, res) => {
    const userId = req.user?.uid;
    const { calculatorType, year, month, data } = req.body;

    if (!userId) {
        return res.status(401).send({ message: 'Não autorizado. O token de utilizador é inválido ou está em falta.' });
    }
    if (!calculatorType || !year || !month || !data) {
        return res.status(400).send({ message: 'Dados incompletos. Faltam calculatorType, year, month ou data.' });
    }

    // --- NOVA LÓGICA DE VALIDAÇÃO ---
    // Verificamos o tipo de calculadora e garantimos que os campos essenciais foram enviados.
    let requiredFields = [];
    switch (calculatorType.toLowerCase()) {
        case 'energia':
            requiredFields = ['Equipamento', 'Potencia', 'Quantidade', 'HorasNoDia', 'DiaNoMes', 'Tarifa'];
            break;
        case 'agua':
            requiredFields = ['ConsumoMensalM3', 'ReutilizacaoDeAguaM3', 'Tarifa'];
            break;
        case 'residuos':
            requiredFields = ['ResiduoReciclavel', 'ResiduoOrganico', 'ResiduoRejeito'];
            break;
        case 'ti':
            requiredFields = ['EquipamentosNovos', 'EquipamentosDescartados', 'EquipamentosReaproveitados'];
            break;
        default:
            return res.status(400).send({ message: `Tipo de calculadora '${calculatorType}' desconhecido.` });
    }

    const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
        return res.status(400).send({ message: `Campos em falta para a calculadora de ${calculatorType}: ${missingFields.join(', ')}` });
    }
    // --- FIM DA VALIDAÇÃO ---

    try {
        await addCalculatorData(userId, calculatorType, year, month, data);
        res.status(201).send({ message: 'Dados da calculadora guardados com sucesso!' });
    } catch (error) {
        console.error("Erro na rota POST /:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao guardar os dados.' });
    }
});

/**
 * Rota para OBTER todos os dados de um utilizador.
 * Método: GET
 * Endpoint: /api/calculator/
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
        console.error("Erro na rota GET /:", error);
        res.status(500).send({ message: 'Ocorreu um erro no servidor ao obter os dados.' });
    }
});

export default router;

