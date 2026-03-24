import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
import CartSidebar from '../../Components/CartSideBar/CartSideBar';
import "./Home.css";

// --- SUB-COMPONENTE: TARJETA INDIVIDUAL ---
// Lo creamos aquí afuera para que cada pizza tenga su propia "memoria" de qué tamaño eligió el usuario.
const ProductoIndividual = ({ prod, agregarAlCarrito }) => {
  const [tamanio, setTamanio] = useState("Grande");

  const handleAgregar = () => {
    // 1. Definimos el precio y nombre según lo que esté marcado en el radio button
    let precioFinal = prod.precio;
    let nombreVariante = "Grande";

    if (tamanio === "Media" && prod.precioMedia) {
      precioFinal = prod.precioMedia;
      nombreVariante = "Media";
    }

    // 2. Enviamos al carrito el producto con el precio correcto
    agregarAlCarrito({
      id: prod.id,
      nombre: prod.nombre,
      precio: precioFinal,
      variante: nombreVariante,
      imagen: prod.imagen
    });
  };

  return (
    <Card className="h-100 shadow-sm border-0 overflow-hidden hover-effect">

      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <Card.Img
          variant="top"
          src={prod.imagen}
          alt={prod.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-2">
          {prod.categoria}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="fw-bold mb-0 cardtitle" style={{ fontSize: '1.5rem' }}>
            {prod.nombre}
          </Card.Title>
        </div>

        <Card.Text className="text-muted small flex-grow-1">
          {prod.descripcion || "Sin descripción"}
        </Card.Text>

        <hr className="my-3" />


        <div className="mt-auto">
          {prod.precioMedia ? (
            <div className="mb-3">
              <Form.Check 
                type="radio"
                id={`grande-${prod.id}`}
                label={`Grande ($${prod.precio})`}
                name={`tamanio-${prod.id}`} 
                checked={tamanio === "Grande"}
                onChange={() => setTamanio("Grande")}
                className="mb-1"
              />
              <Form.Check 
                type="radio"
                id={`media-${prod.id}`}
                label={`Media ($${prod.precioMedia})`}
                name={`tamanio-${prod.id}`}
                checked={tamanio === "Media"}
                onChange={() => setTamanio("Media")}
              />
            </div>
          ) : (
            <div className="mb-3">
               <span className="fw-bold fs-3 text-dark">${prod.precio}</span>
            </div>
          )}

          <Button
            variant="primary"
            className="w-100 fw-bold"
            onClick={handleAgregar}
          >
            Agregar al Pedido 🛒
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// --- COMPONENTE PRINCIPAL HOME ---
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const { agregarAlCarrito, carrito } = useCart();
  const [showCart, setShowCart] = useState(false);

  

  // 1. Cargar productos desde Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(docs);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. Lógica de Filtrado
  const categorias = ["Todos", ...new Set(products.map(p => p.categoria))];

  const productosFiltrados = filtro === "Todos"
    ? products
    : products.filter(p => p.categoria === filtro);

  // 3. FUNCIONES AUXILIARES PARA EL SIDEBAR
  const handleClose = () => setShowCart(false);
  const handleShow = () => setShowCart(true);   

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

      {/* --- HERO HEADER --- */}
      <div className="bg-black py-5 text-center text-white mb-4 shadow">
        <Container>
          <h1 className="display-3 GranPastinicolor">PASTINI</h1>
          <p className="lead">Las mejores pizzas y empanadas 🍕</p>
        </Container>
      </div>

      <Container>

        {/* --- FILTROS --- */}
        <div className="d-flex overflow-auto gap-2 mb-4 pb-2 justify-content-md-center">
          {categorias.map(cat => (
            <Button
              key={cat}
              variant={filtro === cat ? "primary" : "outline-dark"}
              className="rounded-pill px-4"
              onClick={() => setFiltro(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Horneando la carta...</p>
          </div>
        )}

        {/* --- GRILLA DE PRODUCTOS --- */}
        <Row>
          {productosFiltrados.map((prod) => (
            <Col key={prod.id} xs={12} md={6} lg={4} className="mb-4">
       
              <ProductoIndividual 
                prod={prod} 
                agregarAlCarrito={agregarAlCarrito} 
              />
            </Col>
          ))}
        </Row>

        {!loading && productosFiltrados.length === 0 && (
          <div className="text-center py-5">
            <h3>Todavía no hay nada en esta categoría 🍽️</h3>
          </div>
        )}

      </Container>

      {/* COMPONENTE DEL SIDEBAR (CARRITO) */}
      <CartSidebar show={showCart} handleClose={handleClose} />

      {/* BOTÓN FLOTANTE "VER PEDIDO" */}
      {carrito.length > 0 && (
        <div className="fixed-bottom p-3 text-center" style={{ pointerEvents: 'none' }}>
          <Button
            size="lg"
            className="shadow-lg px-5 rounded-pill fw-bold Verpedido"
            style={{ pointerEvents: 'auto' }}
            onClick={handleShow} 
          >
            🛒 Ver Pedido ({carrito.length})
          </Button>
        </div>
      )}

    </div>
  );
};

export default Home;