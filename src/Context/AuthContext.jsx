import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebaseConfig"; 
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";

// 2. Creamos el "Contexto"

const AuthContext = createContext();

// 3. Hook Personalizado "useAuth"
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

// 4. El Componente Proveedor (Provider)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Funciones del Sistema ---

  // Función para Iniciar Sesión (Login)
  // Recibe email y contraseña y se los manda a Firebase.
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Función para Cerrar Sesión (Logout)
  const logout = () => signOut(auth);

  // 5. El "Oído" de la App (useEffect)
  useEffect(() => {
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Usuario actual:", currentUser); 
      setUser(currentUser);
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  // 6. El Paquete de Datos
  const values = {
    user,
    login,
    logout,
    loading
  };

  // Renderizamos el Proveedor.
  return (
    <AuthContext.Provider value={values}>
      {!loading && children}
    </AuthContext.Provider>
  );
};