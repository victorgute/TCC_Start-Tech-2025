// FORÇAR O CARREGAMENTO DAS VARIÁVEIS DE AMBIENTE NESTE FICHEIRO
import 'dotenv/config';

// Importa os clientes e comandos necessários do AWS SDK v3
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

// Configura o cliente do DynamoDB
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME;


/**
 * Função para ADICIONAR dados de uma calculadora com validação.
 */
export const addCalculatorData = async (userId, calculatorType, year, month, data) => {
  // --- NOVA LÓGICA DE VALIDAÇÃO ---
  // Garante que todos os valores numéricos no objeto 'data' não sejam NaN.
  const sanitizedData = {};
  for (const key in data) {
    if (typeof data[key] === 'number' && isNaN(data[key])) {
      sanitizedData[key] = 0; // Se for NaN, converte para 0
    } else {
      sanitizedData[key] = data[key];
    }
  }

  const item = {
    user_uid: userId,
    record_id: `${calculatorType.toUpperCase()}#${year}#${month}`,
    calculator_type: calculatorType,
    // Adiciona uma salvaguarda para o caso de 'year' ou 'month' serem inválidos
    year: parseInt(year, 10) || new Date().getFullYear(),
    month: parseInt(month, 10) || (new Date().getMonth() + 1),
    data: sanitizedData, // Usa o objeto de dados já limpo
    created_at: new Date().toISOString(),
  };

  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log(`[DynamoDB Service] Item guardado com sucesso para o user: ${item.user_uid}`);
    return { success: true, message: 'Dados guardados com sucesso no DynamoDB.', item: item };
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao guardar item:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};

/**
 * Função para OBTER todos os dados de um utilizador.
 */
export const getUserCalculatorData = async (user_uid) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_uid = :uid",
    ExpressionAttributeValues: { ":uid": user_uid },
  };

  try {
    const command = new QueryCommand(params);
    const { Items } = await docClient.send(command);
    console.log(`[DynamoDB Service] Encontrados ${Items.length} itens para o user: ${user_uid}`);
    return Items;
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao obter itens:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};

// ... (as suas outras funções como saveDashboardConfig, etc. continuam aqui)



// --- NOVAS FUNÇÕES PARA O DASHBOARD ---

/**
 * Função para GUARDAR a configuração do dashboard de um utilizador.
 */
export const saveDashboardConfig = async (userId, config) => {
  const item = {
    user_uid: userId,
    record_id: 'DASHBOARD_CONFIG', // Usamos uma chave de ordenação fixa para a configuração
    data: config,
    updated_at: new Date().toISOString()
  };

  const command = new PutCommand({ TableName: tableName, Item: item });
  try {
    await docClient.send(command);
    console.log(`[DynamoDB Service] Configuração do dashboard guardada para o user: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao guardar config:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};

/**
 * Função para OBTER a configuração do dashboard de um utilizador.
 */
export const getDashboardConfig = async (userId) => {
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      user_uid: userId,
      record_id: 'DASHBOARD_CONFIG'
    }
  });

  try {
    const { Item } = await docClient.send(command);
    console.log(`[DynamoDB Service] Configuração do dashboard encontrada para o user: ${userId}`);
    return Item ? Item.data : {}; // Retorna a configuração ou um objeto vazio
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao obter config:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};

