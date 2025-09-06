import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ##################################################################
// COLE A SUA CONFIGURAÇÃO DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "AIzaSyD1OyAxSZWLQq_uaMQJzFxxactW-sMLZ4M",
  authDomain: "ecomanager-tcc.firebaseapp.com",
  projectId: "ecomanager-tcc",
  storageBucket: "ecomanager-tcc.appspot.com",
  messagingSenderId: "807838989383",
  appId: "1:807838989383:web:21327d954d978d3f498562",
  measurementId: "G-6TTFT5PVCX",
};
// ##################################################################

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signUpWithEmail = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    console.error("Erro no registo:", error.message);
    return false;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    console.error("Erro no login:", error.message);
    return false;
  }
};

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
    return true;
  } catch (error) {
    console.error("Erro no login com Google:", error.message);
    return false;
  }
};

export const handleLogout = () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
    });
};

export const getUserToken = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        user
          .getIdToken()
          .then(resolve)
          .catch(() => resolve(null));
      } else {
        resolve(null);
      }
    });
  });
};

export { onAuthStateChanged };
