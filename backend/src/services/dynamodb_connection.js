// src/services/dynamodb_connection.js - VERSÃO CORRIGIDA

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

let docClient;
let tableName;

/**
 * Inicializa a conexão com o DynamoDB usando a configuração carregada.
 * @param {object} config - O objeto de configuração carregado do Parameter Store.
 */
export function initializeDbConnection(config) {
  if (!config.AWS_REGION || !config.DYNAMODB_TABLE_NAME) {
    throw new Error("Configuração do DynamoDB em falta no objeto de configuração.");
  }
  
  // 1. Cria o cliente base do DynamoDB
  const ddbClient = new DynamoDBClient({ region: config.AWS_REGION });
  
  // 2. Cria o DocumentClient, que simplifica o trabalho com JSON
  docClient = DynamoDBDocumentClient.from(ddbClient);
  
  // 3. Armazena o nome da tabela para ser usado pelas outras funções
  tableName = config.DYNAMODB_TABLE_NAME;

  console.log(`[DynamoDB] Conexão inicializada com a tabela: ${tableName}`);
}

// O resto das suas funções permanece igual, pois elas já usam 'docClient' e 'tableName'
// que agora serão inicializadas corretamente.

/**
 * Função para ADICIONAR dados de uma calculadora com validação.
 */
export const addCalculatorData = async (userId, calculatorType, year, month, data) => {
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
    
  const sanitizedData = {};
  for (const key in data) {
    if (typeof data[key] === 'number' && isNaN(data[key])) {
      sanitizedData[key] = 0;
    } else {
      sanitizedData[key] = data[key];
    }
  }

  const item = {
    user_uid: userId,
    record_id: `${calculatorType.toUpperCase()}#${year}#${month}`,
    calculator_type: calculatorType,
    year: parseInt(year, 10) || new Date().getFullYear(),
    month: parseInt(month, 10) || (new Date().getMonth() + 1),
    data: sanitizedData,
    created_at: new Date().toISOString(),
  };

  const command = new PutCommand({ TableName: tableName, Item: item });

  try {
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
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
  
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

/**
 * Função para GUARDAR a configuração do dashboard de um utilizador.
 */
export const saveDashboardConfig = async (userId, config) => {
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
    
  const item = {
    user_uid: userId,
    record_id: 'DASHBOARD_CONFIG',
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
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
  
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      user_uid: userId,
      record_id: 'DASHBOARD_CONFIG'
    }
  });

  try {
    const { Item } = await docClient.send(command);
    if(Item) {
      console.log(`[DynamoDB Service] Configuração do dashboard encontrada para o user: ${userId}`);
      return Item.data;
    }
    console.log(`[DynamoDB Service] Nenhuma configuração de dashboard encontrada para o user: ${userId}`);
    return {};
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao obter config:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};