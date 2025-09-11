// src/middleware/authMiddleware.js - VERSÃO CORRIGIDA

import admin from 'firebase-admin';

/**
 * Inicializa o SDK do Firebase Admin com as credenciais da conta de serviço.
 * @param {object} serviceAccount - O objeto da conta de serviço do Firebase.
 */
export function initializeFirebase(serviceAccount) {
    if (admin.apps.length) {
        return; // Previne reinicialização
    }
    
    // A verificação agora é mais direta, checando se o objeto existe e tem uma propriedade essencial
    if (!serviceAccount || !serviceAccount.project_id) {
        throw new Error("Objeto da conta de serviço do Firebase (serviceAccount) é inválido ou está em falta.");
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount) // Usa o parâmetro diretamente
    });
    console.log("[Firebase Admin] SDK inicializado com sucesso.");
}

/**
 * Middleware para Express que verifica o token de autenticação do Firebase.
 */
export const firebaseAuthMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token de autorização em falta ou mal formatado.' });
  }

  const idToken = authorizationHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro ao verificar o token de autenticação:', error);
    return res.status(403).send({ message: 'Token inválido ou expirado.' });
  }
};