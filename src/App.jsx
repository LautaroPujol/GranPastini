
import Home from "./pages/Home/Home";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Login/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute} from "./Components/ProtectedRoute/ProtectedRoute";
import Checkout from "./pages/Checkout/Checkout";





function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute> <Admin /> </ProtectedRoute>} />
          <Route path="/checkout" element= {<Checkout/>}/>


        </Routes>

      </BrowserRouter>
    </div>
  );
}

// 3. Exportamos el componente para que main.jsx lo pueda mostrar.
export default App;