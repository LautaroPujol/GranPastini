import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError(""); 

    try {
      // 👇 3. Login
      await login(email, password);
      
      // Si el login es exitoso, redirigimos al admin
      navigate("/admin");
      
    } catch (error) {
      // Si algo falla (contraseña mal, usuario no existe), cae acá.
      
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