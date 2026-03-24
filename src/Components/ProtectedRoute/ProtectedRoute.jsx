import { Navigate } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext"; 

// Este componente envuelve a las páginas que queremos proteger (como Admin)
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Si Firebase todavía está pensando, mostramos un mensaje de espera.
  if (loading) return <h1>Cargando...</h1>;

  // 2. Si NO hay usuario (user es null), lo echamos al Login.
  if (!user) return <Navigate to="/login" />;

  // 3. Si hay usuario, le permitimos ver la página protegida (children).
  return <>{children}</>;
};