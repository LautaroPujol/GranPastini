import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Card } from 'react-bootstrap';
import { useCart } from '../../Context/CartContext'; // Revisá si tu carpeta es Context o context
import { db } from '../../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { carrito, total, vaciarCarrito } = useCart();
  const navigate = useNavigate();

  // --- ESTADOS DEL FORMULARIO ---
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  
  // Nuevos Estados
  const [formaEntrega, setFormaEntrega] = useState("Envio"); // Valor inicial: Envio
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const [procesando, setProcesando] = useState(false);

  // ⚠️ TU NÚMERO DE WHATSAPP
  const TELEFONO_DEL_LOCAL = "5493704252853"; 

  const handleConfirmar = async (e) => {
    e.preventDefault();
    
    if (carrito.length === 0) return; 
    setProcesando(true);

    try {
      // 1. Armamos el objeto de la Orden
      const orden = {
        cliente: { nombre, telefono, direccion: formaEntrega === "Envio" ? direccion : "Retira en Local" },
        items: carrito, 
        total: total,
        formaEntrega, // Guardamos si es delivery o retiro
        metodoPago,   // Guardamos como paga
        fecha: serverTimestamp(),
        estado: "pendiente"
      };

      // 2. Guardamos en Firebase
      const docRef = await addDoc(collection(db, "orders"), orden);
      const idPedidoCorto = docRef.id.slice(0, 8); 

      // 3. ARMAMOS EL MENSAJE DE WHATSAPP 💬
      let mensajeWsp = `*¡Hola!* Quiero realizar el siguiente pedido`;
      
      carrito.forEach(item => {
        mensajeWsp += `➖ ${item.cantidad}x ${item.nombre} (${item.variante}) $${item.precio * item.cantidad}\n`;
      });

      mensajeWsp += `\n💰 *TOTAL: $${total}*\n`;
      mensajeWsp += `💳 *Pago:* ${metodoPago}\n`;
      mensajeWsp += `🚚 *Entrega:* ${formaEntrega}\n\n`;
      
      mensajeWsp += `👤 *Mis Datos:*\n`;
      mensajeWsp += `Nombre: ${nombre}\n`;
      // Solo mostramos dirección si pidió envío
      if (formaEntrega === "Envio") {
          mensajeWsp += `📍 Dirección: ${direccion}\n`;
      }
      mensajeWsp += `📞 Teléfono: ${telefono}`;

      // 4. Limpiamos y Redirigimos
      vaciarCarrito();
      const urlWhatsApp = `https://wa.me/${TELEFONO_DEL_LOCAL}?text=${encodeURIComponent(mensajeWsp)}`;
      window.open(urlWhatsApp, '_blank');
      navigate("/");

    } catch (error) {
      console.error("Error al procesar:", error);
      alert("Hubo un error. Intenta de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  if (carrito.length === 0) {
    return (
        <Container className="text-center mt-5">
            <h3>Tu carrito está vacío 🤷‍♂️</h3>
            <Button variant="outline-primary" className="mt-3" onClick={() => navigate("/")}>Volver al Menú</Button>
        </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Finalizar Pedido 🍽️</h2>
      <Row>
        <Col md={7}>
          <Card className="p-4 shadow-sm border-0 mb-4">
            <h4 className="mb-3">Detalles de Entrega</h4>
            <Form onSubmit={handleConfirmar}>
              
              <Row>
                {/* --- SELECCIÓN DE ENTREGA --- */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>¿Cómo recibís el pedido?</Form.Label>
                        <Form.Select value={formaEntrega} onChange={(e) => setFormaEntrega(e.target.value)}>
                            <option value="Envio">🛵 Envío a Domicilio (Delivery)</option>
                            <option value="Retiro">🏪 Retiro en el Local</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                
                {/* --- SELECCIÓN DE PAGO --- */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>¿Cómo vas a pagar?</Form.Label>
                        <Form.Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                            <option value="Efectivo">💵 Efectivo</option>
                            <option value="Mercado Pago">📲 Transferencia / Mercado Pago</option>
                            <option value="Tarjeta">💳 Tarjeta (Crédito/Débito)</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
              </Row>

              <hr />

              {/* --- DATOS PERSONALES --- */}
              <Form.Group className="mb-3">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control 
                    type="text" required placeholder="Tu nombre..." 
                    value={nombre} onChange={(e) => setNombre(e.target.value)} 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono / WhatsApp</Form.Label>
                <Form.Control 
                    type="tel" required placeholder="Tu celular..." 
                    value={telefono} onChange={(e) => setTelefono(e.target.value)} 
                />
              </Form.Group>

              {/* --- CAMPO DIRECCIÓN (CONDICIONAL) --- */}
              {/* Solo aparece si formaEntrega es "Envio" */}
              {formaEntrega === "Envio" && (
                  <div className="p-3 bg-light rounded mb-3 border">
                      <Form.Group>
                        <Form.Label>📍 Dirección de Entrega</Form.Label>
                        <Form.Control 
                            type="text" 
                            required // Es obligatorio solo si es envío
                            placeholder="Calle, Altura, Barrio, Piso..." 
                            value={direccion} onChange={(e) => setDireccion(e.target.value)} 
                        />
                        <Form.Text className="text-muted">
                            Asegurate de poner todos los detalles para el delivery.
                        </Form.Text>
                      </Form.Group>
                  </div>
              )}

              <Button type="submit" variant="success" size="lg" className="w-100 mt-3" disabled={procesando}>
                {procesando ? "Procesando..." : `Enviar Pedido a WhatsApp 📲`}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* --- RESUMEN (Derecha) --- */}
        <Col md={5}>
            <Card className="shadow-sm border-0 bg-light">
                <Card.Header className="bg-dark text-white">Resumen de Compra</Card.Header>
                <ListGroup variant="flush">
                    {carrito.map((item, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center bg-transparent">
                            <div>
                                <strong>{item.nombre}</strong> <br/>
                                <small className="text-muted">x{item.cantidad} | {item.variante}</small>
                            </div>
                            <div className="fw-bold">${item.precio * item.cantidad}</div>
                        </ListGroup.Item>
                    ))}
                    
                    {/* COSTO DE ENVÍO (Opcional visualmente) */}
                    {formaEntrega === "Envio" && (
                        <ListGroup.Item className="d-flex justify-content-between bg-transparent text-muted">
                            <span>Costo de envío</span>
                            <span>A coordinar</span>
                        </ListGroup.Item>
                    )}

                    <ListGroup.Item className="fw-bold fs-4 d-flex justify-content-between bg-white mt-3 border-top">
                        <span>TOTAL</span>
                        <span className="text-success">${total}</span>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;