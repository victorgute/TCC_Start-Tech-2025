import admin from 'firebase-admin';

/**
 * Inicializa o SDK do Firebase Admin com as credenciais carregadas da configuração.
 * Só é executado uma vez.
 * @param {object} config - O objeto de configuração carregado do Parameter Store.
 */
export function initializeFirebase(config) {
    if (admin.apps.length) {
        return; // Previne reinicialização
    }
    if (!config || !config.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("Configuração do Firebase (serviceAccount) incompleta ou em falta.");
    }

    admin.initializeApp({
        credential: admin.credential.cert(config.FIREBASE_SERVICE_ACCOUNT)
    });
    console.log("[Firebase Admin] SDK inicializado com sucesso.");
}

/**
 * Middleware para Express que verifica o token de autenticação do Firebase.
 * O front-end deve enviar o token no cabeçalho 'Authorization'.
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
