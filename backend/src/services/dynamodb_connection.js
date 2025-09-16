import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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
// --- FUNÇÕES CRUD PARA DADOS DA CALCULADORA ---
export const addCalculatorData = async (userId, workspaceId, calculatorType, year, month, data) => {
  const item = {
    user_uid: userId,
    record_id: `${workspaceId}#${calculatorType.toUpperCase()}#${year}#${month}#${Date.now()}`, // Adicionado timestamp para ID único
    workspace_id: workspaceId,
    calculator_type: calculatorType,
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    data: data,
    created_at: new Date().toISOString(),
  };
  const command = new PutCommand({ TableName: tableName, Item: item });
  await docClient.send(command);
  return item;
};

/**
 * Função para OBTER todos os dados de um utilizador.
 */
export const getUserCalculatorData = async (user_uid, workspaceId) => {
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
  if (!workspaceId) throw new Error("Workspace ID é necessário para buscar dados.");
  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_uid = :uid AND begins_with(record_id, :workspace)",
    ExpressionAttributeValues: { ":uid": user_uid, ":workspace": `${workspaceId}#` },
  };
  try {
    const { Items } = await docClient.send(new QueryCommand(params));
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

// Adicione esta função ao final de dynamodb_connection.js
// --- FUNÇÕES DE SNAPSHOT E CONFIG DO DASHBOARD ---
export const saveDashboardSnapshotData = async (userId, name, snapshotData) => {
  const item = {
    user_uid: userId,
    record_id: `SNAPSHOT#${new Date().toISOString()}`,
    snapshot_name: name,
    data: snapshotData,
    created_at: new Date().toISOString()
  };
  const command = new PutCommand({ TableName: tableName, Item: item });
  await docClient.send(command);
  return { success: true };
}; 


export const getWorkspaces = async (userId) => {
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_uid = :uid AND begins_with(record_id, :prefix)",
    ExpressionAttributeValues: { ":uid": userId, ":prefix": "WORKSPACE#" },
  };
  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    return Items;
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao obter workspaces:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};

export const createWorkspace = async (userId, workspaceName) => {
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
  const workspaceId = `WKS-${Date.now()}`; // Cria um ID único
  const item = {
    user_uid: userId,
    record_id: `WORKSPACE#${workspaceId}`,
    workspace_name: workspaceName,
    created_at: new Date().toISOString()
  };
  const command = new PutCommand({ TableName: tableName, Item: item });
  try {
    await docClient.send(command);
    return item;
  } catch (error) {
    console.error(`[DynamoDB Service] Erro ao criar workspace:`, error);
    throw new Error('Erro ao comunicar com o DynamoDB.');
  }
};

// --- FUNÇÕES CRUD PARA METAS ESG ---

export const getGoals = async (userId) => {
  if (!docClient) throw new Error("A conexão com o DynamoDB não foi inicializada.");
  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_uid = :uid AND begins_with(record_id, :prefix)",
    ExpressionAttributeValues: { ":uid": userId, ":prefix": "GOAL#" },
  };
  const { Items } = await docClient.send(new QueryCommand(params));
  return Items;
};

export const createGoal = async (userId, goalData) => {
  const goalId = `G-${Date.now()}`;
  const item = {
    user_uid: userId,
    record_id: `GOAL#${goalId}`,
    ...goalData,
    created_at: new Date().toISOString()
  };
  const command = new PutCommand({ TableName: tableName, Item: item });
  await docClient.send(command);
  return item;
};

export const updateGoal = async (userId, recordId, goalData) => {
    const getCommand = new GetCommand({ TableName: tableName, Key: { user_uid: userId, record_id: recordId } });
    const { Item: existingItem } = await docClient.send(getCommand);

    if (!existingItem) {
        throw new Error("Meta não encontrada para atualizar.");
    }
    const updatedItem = { ...existingItem, ...goalData, updated_at: new Date().toISOString() };
    const command = new PutCommand({ TableName: tableName, Item: updatedItem });
    await docClient.send(command);
    return updatedItem;
};

export const deleteGoal = async (userId, recordId) => {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: { user_uid: userId, record_id: recordId },
  });
  await docClient.send(command);
  return { success: true };
};