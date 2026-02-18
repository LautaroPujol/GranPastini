// 1. Importamos las herramientas de React y Firebase
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebaseConfig"; // Importamos la conexión a Firebase
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";

// 2. Creamos el "Contexto"
// Imaginátelo como una nube invisible que va a flotar sobre toda tu app
// guardando información (quién está logueado).
const AuthContext = createContext();

// 3. Hook Personalizado "useAuth"
// Esta función es un atajo. En vez de importar "useContext" y "AuthContext" 
// en cada archivo, solo vamos a importar "useAuth()" y listo.
// Es una buena práctica de Senior para escribir menos código después.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

// 4. El Componente Proveedor (Provider)
// Este es el componente que va a envolver a toda tu aplicación.
export const AuthProvider = ({ children }) => {
  // 'user': Guarda la info del usuario (o null si no hay nadie).
  const [user, setUser] = useState(null);
  // 'loading': Nos dice si Firebase todavía está pensando. Es clave para no mostrar la app vacía.
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
    // onAuthStateChanged es un espía. 🕵️‍♂️
    // Se queda escuchando cambios en Firebase. Si el usuario se loguea o desloguea,
    // esta función se ejecuta automáticamente y actualiza nuestro estado 'user'.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Usuario actual:", currentUser); // Para ver en consola quién entró
      setUser(currentUser);
      setLoading(false); // Dejamos de cargar porque ya sabemos si hay usuario o no
    });

    return () => unsubscribe(); // Limpieza: apaga el espía si el componente se destruye.
  }, []);

  // 6. El Paquete de Datos
  // Todo lo que pongamos acá va a estar disponible para cualquier componente de la app.
  const values = {
    user,
    login,
    logout,
    loading
  };

  // Renderizamos el Proveedor.
  // "!loading && children" significa: "Si NO está cargando, mostrá la app (children)".
  return (
    <AuthContext.Provider value={values}>
      {!loading && children}
    </AuthContext.Provider>
  );
};