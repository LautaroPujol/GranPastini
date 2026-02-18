// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"; // Importamos el componente para redirigir
import { useAuth } from "../../context/AuthContext"; // Importamos nuestro contexto para ver si hay usuario

// Este componente envuelve a las páginas que queremos proteger (como Admin)
// "children" es la página que está adentro (en este caso, <Admin />)
export const ProtectedRoute = ({ children }) => {
  // Sacamos el usuario y el estado de "cargando" del contexto
  const { user, loading } = useAuth();

  // 1. Si Firebase todavía está pensando, mostramos un mensajito de espera.
  // (Acá podrías poner un Spinner bonito de Bootstrap más adelante)
  if (loading) return <h1>Cargando...</h1>;

  // 2. Si NO hay usuario (user es null), lo echamos al Login.
  if (!user) return <Navigate to="/login" />;

  // 3. Si hay usuario, le permitimos ver la página protegida (children).
  return <>{children}</>;
};