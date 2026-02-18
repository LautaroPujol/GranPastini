// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // ⚠️ ACÁ PEGÁ TUS CREDENCIALES DE FIREBASE (Las que ya tenías)
  apiKey: "AIzaSyDqpTavZxhwQHf5WVg_J6_M26s4wiDSQ0g",
  authDomain: "granpastini-27f3f.firebaseapp.com",
  projectId: "granpastini-27f3f",
  storageBucket: "granpastini-27f3f.firebasestorage.app",
  messagingSenderId: "781200814070",
  appId: "1:781200814070:web:48ff1205d3bf9d4f66a1d7"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);

// Exportamos solo lo que vamos a usar: Auth (Login) y DB (Base de datos)
export const auth = getAuth(app);
export const db = getFirestore(app);