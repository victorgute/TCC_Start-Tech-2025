// Importe o Firebase Admin SDK. Ele permite que o seu back-end interaja
// com os serviços do Firebase de forma segura.
import admin from 'firebase-admin';

// IMPORTANTE: Precisa de obter o seu ficheiro de credenciais do Firebase.
// Siga o "Guia_Middleware_Firebase.md" para saber como o obter.
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' };

// --- Inicialização do Firebase Admin ---
// Isto só precisa de ser feito uma vez, quando a aplicação arranca.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

/**
 * Middleware para Express que verifica o token de autenticação do Firebase.
 * O front-end deve enviar o token no cabeçalho (header) 'Authorization'.
 * Exemplo: Authorization: Bearer <SEU_TOKEN_AQUI>
 */
export const firebaseAuthMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  // 1. Verifique se o cabeçalho 'Authorization' existe e começa com 'Bearer '.
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token de autorização em falta ou mal formatado.' });
  }

  // 2. Extraia o token do cabeçalho.
  const idToken = authorizationHeader.split('Bearer ')[1];

  // 3. Verifique o token usando o Firebase Admin SDK.
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // 4. Se o token for válido, anexe as informações do utilizador ao objeto 'req'.
    // Agora, todas as rotas seguintes terão acesso a 'req.user'.
    req.user = decodedToken;
    
    // 5. Chame 'next()' para passar o controlo para a próxima função (a sua rota).
    next();
  } catch (error) {
    console.error('Erro ao verificar o token de autenticação:', error);
    return res.status(403).send({ message: 'Token inválido ou expirado.' });
  }
};


