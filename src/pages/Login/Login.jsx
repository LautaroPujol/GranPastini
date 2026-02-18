import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
// 👇 1. Importamos estas dos herramientas nuevas
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Estado para mostrar errores si falla el login
  const [error, setError] = useState("");

  // 👇 2. Inicializamos los hooks
  const { login } = useAuth(); // Traemos la función login del contexto
  const navigate = useNavigate(); // Para movernos de página

  const handleSubmit = async (e) => { // 👈 OJO: Agregá "async" acá
    e.preventDefault();
    setError(""); // Limpiamos errores previos

    try {
      // 👇 3. Intentamos loguear. "await" significa: "Esperá a que Firebase responda"
      await login(email, password);
      
      // Si pasa la línea de arriba, es que todo salió bien.
      // Nos vamos al panel de admin:
      navigate("/admin");
      
    } catch (error) {
      // Si algo falla (contraseña mal, usuario no existe), cae acá.
      console.log(error.code); // Para que veas el código de error en consola
      // Traducimos un poco el error para el usuario
      if(error.code === "auth/invalid-credential") {
         setError("Correo o contraseña incorrectos");
      } else {
         setError("Hubo un error al intentar ingresar");
      }
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center Minimo">
      <Card className="Maxww">
        <Card.Body>
          <h2 className="text-center mb-4">Admin Pastini</h2>
          
          {/* 👇 Mostramos el cartel de error si existe */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Ingresá tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Ingresar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;