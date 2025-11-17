import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Substituir pelos valores reais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instância do Firestore
export const db = getFirestore(app);
