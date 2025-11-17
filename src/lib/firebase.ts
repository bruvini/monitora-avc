import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvgWppRYjPIP22U9-vu-J2dwrhJ2Klvpc",
  authDomain: "pmj-hmsj.firebaseapp.com",
  projectId: "pmj-hmsj",
  storageBucket: "pmj-hmsj.firebasestorage.app",
  messagingSenderId: "226296836721",
  appId: "1:226296836721:web:3c8893c66567f2aee6e1d0",
  measurementId: "G-BSWLK4FQ9V",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instância do Firestore
export const db = getFirestore(app);
