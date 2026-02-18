// 1. IMPORTS: Traemos las herramientas necesarias
import React, { useState, useEffect } from 'react';
// Componentes visuales de Bootstrap (Botones, Tablas, Pestañas, Alertas, etc.)
import { Container, Form, Button, Navbar, Card, Alert, Row, Col, Table, Tabs, Tab, Badge, Modal } from 'react-bootstrap';
// Hooks para saber si el usuario está logueado y para navegar entre páginas
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Conexión a la Base de Datos (db)
import { db } from '../../services/firebaseConfig';
// Funciones de Firebase para leer, guardar, borrar y editar datos
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const Admin = () => {
  // --- HOOKS DE NAVEGACIÓN Y SESIÓN ---
  const { logout, user } = useAuth(); // Para saber quién es el usuario y poder salir
  const navigate = useNavigate(); // Para redirigir (ej: al login si cierra sesión)

  // --- ESTADOS (VARIABLES QUE CAMBIAN EN PANTALLA) ---

  // Controla qué pestaña estamos viendo: 'ventas' (Dashboard) o 'productos' (Carga)
  const [activeTab, setActiveTab] = useState('ventas');

  // Estados para mostrar carteles de "Cargando...", Éxito o Error
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // --- ESTADOS PARA EL FORMULARIO DE PRODUCTOS ---
  const [listaProductos, setListaProductos] = useState([]); // Lista de pizzas cargadas
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Pizzas");
  const [precio, setPrecio] = useState("");
  const [precioMedia, setPrecioMedia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [idEditar, setIdEditar] = useState(null); // Si esto tiene un ID, estamos editando. Si es null, creando.

  // --- ESTADOS DEL DASHBOARD DE VENTAS (LO NUEVO) 💰 ---

  // 1. CAJA DIARIA:
  const [ventasHoy, setVentasHoy] = useState(0); // Suma total de dinero de HOY
  const [pedidosHoy, setPedidosHoy] = useState([]); // Lista de tickets de HOY

  // 2. REGISTRO MENSUAL:
  const [registroMensual, setRegistroMensual] = useState([]); // Array con el resumen por mes

  // 3. DETALLE DEL TICKET (POP-UP):
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); // Qué pedido estamos mirando
  const [showModal, setShowModal] = useState(false); // Si la ventanita está abierta o cerrada

  // --------------------------------------------------------
  // 1. CEREBRO DE DATOS (ACÁ ESTÁ LA MAGIA) 🧠
  // Esta función se ejecuta apenas entras a la página
  // --------------------------------------------------------
  const obtenerDatos = async () => {
    try {
      // A) TRAER PRODUCTOS DE FIREBASE
      // Vamos a la colección "products" y bajamos todo
      const prodData = await getDocs(collection(db, "products"));
      // Transformamos los datos raros de Firebase a un array limpio con ID
      setListaProductos(prodData.docs.map(d => ({ ...d.data(), id: d.id })));

      // B) TRAER PEDIDOS (VENTAS)
      // Vamos a la colección "orders" y bajamos todo
      const orderData = await getDocs(collection(db, "orders"));

      // --- PREPARAMOS LAS VARIABLES PARA CALCULAR ---
      let sumaHoy = 0;   // Acá vamos a sumar la plata de hoy
      let listaHoy = []; // Acá vamos a guardar los tickets de hoy
      let mapaMeses = {}; // Acá vamos a agrupar por mes (Ej: "2/2026": $50000)

      // Obtenemos la fecha de HOY en formato texto (Ej: "13/2/2026")
      // Esto es CLAVE: Si la fecha del pedido no coincide con esto, no se suma al día.
      const hoyString = new Date().toLocaleDateString();

      // Recorremos pedido por pedido...
      const pedidos = orderData.docs.map(d => {
        const data = d.data();

        // Convertimos la fecha rara de Firebase (Timestamp) a Fecha Real de Javascript
        const fechaObj = data.fecha?.seconds ? new Date(data.fecha.seconds * 1000) : new Date();
        const fechaString = fechaObj.toLocaleDateString(); // "13/2/2026"

        // --- LÓGICA DIARIA (El Reset Automático) ---
        // Preguntamos: ¿La fecha del pedido es IGUAL a la fecha de hoy?
        if (fechaString === hoyString) {
          // SÍ: Entonces sumalo a la caja del día
          sumaHoy += (data.total || 0);
          // Y agregalo a la lista de tickets de hoy
          listaHoy.push({ ...data, id: d.id, fechaReal: fechaObj });
        }

        // --- LÓGICA MENSUAL (Historial) ---
        // Creamos una clave única por mes: "Mes/Año" (Ej: "2/2026")
        const claveMes = `${fechaObj.getMonth() + 1}/${fechaObj.getFullYear()}`;

        // Si este mes todavía no existe en nuestro mapa, lo creamos en cero
        if (!mapaMeses[claveMes]) {
          mapaMeses[claveMes] = { total: 0, cantidad: 0, mes: claveMes };
        }
        // Sumamos la plata y la cantidad de pedidos a ese mes
        mapaMeses[claveMes].total += (data.total || 0);
        mapaMeses[claveMes].cantidad += 1;

        return { ...data, id: d.id, fechaReal: fechaObj };
      });

      // --- GUARDAMOS LOS RESULTADOS EN LOS ESTADOS PARA QUE SE VEAN EN PANTALLA ---
      setVentasHoy(sumaHoy); // Actualizamos el cartel verde gigante

      // Ordenamos los pedidos de hoy para que el más nuevo salga primero
      setPedidosHoy(listaHoy.sort((a, b) => b.fechaReal - a.fechaReal));

      // Convertimos el mapa de meses en una lista simple para la tabla
      const arrayMeses = Object.values(mapaMeses);
      setRegistroMensual(arrayMeses);

    } catch (e) {
      console.error("Error trayendo datos:", e);
    }
  };

  // useEffect: Esto le dice a React "Ejecutá obtenerDatos() UNA VEZ cuando cargue la página"
  useEffect(() => {
    obtenerDatos();
  }, []);

  // --------------------------------------------------------
  // 2. LÓGICA DE PRODUCTOS (Guardar en Base de Datos)
  // --------------------------------------------------------
  const handleSubmitProducto = async (e) => {
    e.preventDefault(); // Evita que se recargue la página al enviar el form
    setCargando(true); setError(""); setMensaje(""); // Reseteamos mensajes

    try {
      // Validaciones simples
      if (!nombre || !precio) throw new Error("Faltan datos obligatorios");
      if (Number(precio) < 0) throw new Error("El precio no puede ser negativo");

      // Preparamos el objeto para guardar
      const datos = {
        nombre, categoria, descripcion,
        precio: Number(precio),
        precioMedia: precioMedia ? Number(precioMedia) : null, // Si está vacío, guardamos null
        imagen: imagen || "https://placehold.co/600x400?text=Sin+Foto" // Foto por defecto si no ponen nada
      };

      if (idEditar) {
        // MODO EDICIÓN: Actualizamos el documento existente
        await updateDoc(doc(db, "products", idEditar), datos);
        setMensaje("Producto actualizado 📝");
        setIdEditar(null); // Salimos del modo edición
      } else {
        // MODO CREACIÓN: Creamos uno nuevo
        await addDoc(collection(db, "products"), { ...datos, fechaCreacion: new Date() });
        setMensaje("Producto creado 🍕");
      }

      // Limpiamos los campos del formulario
      setNombre(""); setPrecio(""); setPrecioMedia(""); setDescripcion(""); setImagen("");
      // Volvemos a pedir los datos para que la tabla se actualice sola
      obtenerDatos();

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false); // Terminó de cargar
    }
  };

  // Función para rellenar el formulario cuando tocan el lápiz ✏️
  const activarEdicion = (prod) => {
    setNombre(prod.nombre); setCategoria(prod.categoria); setPrecio(prod.precio);
    setPrecioMedia(prod.precioMedia || ""); setDescripcion(prod.descripcion || "");
    setImagen(prod.imagen || ""); setIdEditar(prod.id);
    setMensaje("Editando: " + prod.nombre);
    window.scrollTo(0, 0); // Sube la pantalla arriba
  };

  // Función para borrar (pide confirmación)
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Borrar producto?")) return;
    try { await deleteDoc(doc(db, "products", id)); obtenerDatos(); } catch (e) { console.error(e); }
  };

  // Función para abrir el modal del ticket
  const verDetallePedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowModal(true);
  };

  // Función para cerrar sesión
  const handleLogout = async () => { try { await logout(); navigate("/login"); } catch (e) { console.error(e); } };

  // --- COMIENZO DEL DISEÑO VISUAL (JSX) ---
  return (
    <>
      {/* BARRA SUPERIOR NEGRA */}
      <Navbar bg="dark" variant="dark" className="px-3 mb-4 d-flex justify-content-between">
        <Navbar.Brand>🎩 Admin Pastini</Navbar.Brand>
        <div className="d-flex gap-3 align-items-center">
          <span className="text-white small d-none d-md-block">{user?.email}</span>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>Salir</Button>
        </div>
      </Navbar>

      <Container className="mb-5">

        {/* SISTEMA DE PESTAÑAS (TABS) */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4" fill>

          {/* =============================================
              PESTAÑA 1: CAJA Y VENTAS (DASHBOARD)
             ============================================= */}
          <Tab eventKey="ventas" title="📈 CAJA Y REGISTROS">

            {/* CARTEL VERDE GIGANTE (Total del Día) */}
            <Row className="mb-4">
              <Col md={12}>
                <Card className="bg-success text-white text-center shadow border-0 mb-3">
                  <Card.Body className="py-4">
                    <h5 className="text-white-50 uppercase">Ventas de HOY ({new Date().toLocaleDateString()})</h5>
                    {/* Acá mostramos el estado ventasHoy formateado */}
                    <h1 className="display-3 fw-bold">${ventasHoy.toLocaleString()}</h1>
                    <p className="mb-0">Pedidos del día: {pedidosHoy.length}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              {/* TABLA IZQUIERDA: DETALLE DE TICKETS DE HOY */}
              <Col lg={7} className="mb-4">
                <div className="bg-white rounded shadow-sm p-3 border h-100">
                  <h5 className="mb-3 border-bottom pb-2">🧾 Tickets de Hoy</h5>
                  <Table hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Recorremos solo la lista de hoy */}
                      {pedidosHoy.map((pedido) => (
                        <tr key={pedido.id}>
                          <td>{pedido.fechaReal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>{pedido.cliente?.nombre}</td>
                          <td className="fw-bold">${pedido.total}</td>
                          <td>
                            <Button variant="link" size="sm" onClick={() => verDetallePedido(pedido)}>👁️</Button>
                          </td>
                        </tr>
                      ))}
                      {/* Mensaje si está vacío */}
                      {pedidosHoy.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-3">Aún no abriste caja hoy 😴</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>

              {/* TABLA DERECHA: HISTORIAL MENSUAL */}
              <Col lg={5} className="mb-4">
                <div className="bg-light rounded shadow-sm p-3 border h-100">
                  <h5 className="mb-3 border-bottom pb-2">📅 Registro Mensual</h5>
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Pedidos</th>
                        <th>Total ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Recorremos el array de meses calculado arriba */}
                      {registroMensual.map((reg, index) => (
                        <tr key={index}>
                          <td>{reg.mes}</td>
                          <td>{reg.cantidad}</td>
                          <td className="fw-bold text-success">${reg.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </Tab>


          {/* =============================================
              PESTAÑA 2: GESTIÓN DE PRODUCTOS
             ============================================= */}
          <Tab eventKey="productos" title="🍔 GESTIÓN DE PRODUCTOS">
            <Card className="shadow-sm border-0 mb-5">
              <Card.Body className="p-4">
                <h4 className="mb-3">{idEditar ? "📝 Editando" : "➕ Nuevo Producto"}</h4>
                {/* Alertas de error o éxito */}
                {error && <Alert variant="danger">{error}</Alert>}
                {mensaje && <Alert variant="success">{mensaje}</Alert>}

                {/* FORMULARIO DE CARGA */}
                <Form onSubmit={handleSubmitProducto}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                          <option value="Pizzas">Pizzas</option>
                          <option value="Papas Fritas">Papas Fritas</option>
                          <option value="Picadas">Picadas</option>
                          <option value="Sandwiches">Sandwiches / Lomitos</option>
                          <option value="Bebidas">Bebidas</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Precio</Form.Label>
                        <Form.Control type="number" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-muted small">Precio 1/2</Form.Label>
                        <Form.Control type="number" min="0" value={precioMedia} onChange={(e) => setPrecioMedia(e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción del Producto</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Ej: Salsa de tomate casera, muzzarella, jamón..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Link Foto</Form.Label>
                    <Form.Control type="text" value={imagen} onChange={(e) => setImagen(e.target.value)} />
                  </Form.Group>

                  <Button variant={idEditar ? "warning" : "primary"} type="submit" className="w-100 fw-bold" disabled={cargando}>
                    {cargando ? "Procesando..." : (idEditar ? "Guardar Cambios" : "Crear Producto")}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* TABLA DE PRODUCTOS CARGADOS */}
            <div className="table-responsive bg-white rounded shadow-sm p-3">
              <Table hover align="middle">
                <thead><tr><th>Foto</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
                <tbody>
                  {listaProductos.map((prod) => (
                    <tr key={prod.id}>
                      <td><img src={prod.imagen} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} /></td>
                      <td>{prod.nombre}<br /><small className="text-muted">{prod.categoria}</small></td>
                      <td>${prod.precio}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => activarEdicion(prod)}>✏️</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => eliminarProducto(prod.id)}>🗑️</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

        </Tabs>
      </Container>

      {/* --- MODAL (POP-UP) PARA VER DETALLE DEL TICKET --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ticket de Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pedidoSeleccionado && (
            <>
              <div className="alert alert-secondary mb-3">
                <strong>👤 Cliente:</strong> {pedidoSeleccionado.cliente?.nombre} <br />
                <strong>📞 Tel:</strong> {pedidoSeleccionado.cliente?.telefono} <br />
                <strong>📍 Dirección:</strong> {pedidoSeleccionado.cliente?.direccion}
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Pago: <strong>{pedidoSeleccionado.metodoPago}</strong></span>
                <span>Entrega: <strong>{pedidoSeleccionado.formaEntrega}</strong></span>
              </div>

              <hr />
              <h6>🛒 Productos:</h6>
              <ul className="list-group list-group-flush">
                {pedidoSeleccionado.items?.map((item, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between px-0">
                    <span>{item.cantidad} x <strong>{item.nombre}</strong> ({item.variante})</span>
                    <span>${item.precio * item.cantidad}</span>
                  </li>
                ))}
              </ul>
              <hr />
              <h3 className="text-end text-success">Total: ${pedidoSeleccionado.total}</h3>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default Admin;