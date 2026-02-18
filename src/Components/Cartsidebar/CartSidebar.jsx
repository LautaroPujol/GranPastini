import React from 'react';
import { Offcanvas, ListGroup, Button } from 'react-bootstrap';
// 👇 1. IMPORTANTE: Agregamos 'agregarAlCarrito' y 'decrementarCantidad' aquí
import { useCart } from '../../Context/CartContext';
import { Link } from 'react-router-dom';
import "./CartSideBar.css"

const CartSidebar = ({ show, handleClose }) => {

    // 👇 2. Traemos las funciones nuevas del contexto para usarlas en los botones
    const {
        carrito,
        total,
        eliminarDelCarrito,
        vaciarCarrito,
        agregarAlCarrito,    // Para el botón [+]
        decrementarCantidad  // Para el botón [-]
    } = useCart();

    return (
        <Offcanvas show={show} onHide={handleClose} placement="end">

            <Offcanvas.Header closeButton className="bg-dark text-white">
                <Offcanvas.Title>Tu Pedido 🍽️</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="d-flex flex-column">

                {carrito.length === 0 ? (
                    <div className="text-center my-auto text-muted">
                        <h4>El carrito está vacío 😢</h4>
                    </div>
                ) : (
                    <>
                        <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
                            {carrito.map((item, index) => (
                                <ListGroup.Item key={index} className="py-3">

                                    {/* --- INFORMACIÓN DEL PRODUCTO (Arriba) --- */}
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <div className="fw-bold">{item.nombre}</div>
                                            <small className="text-muted">{item.variante}</small>
                                        </div>
                                        <div className="text-primary fw-bold">
                                            ${item.precio * item.cantidad}
                                        </div>
                                    </div>

                                    {/* --- CONTROLES DE CANTIDAD (Abajo) --- */}
                                    {/* Esta es la barra gris con los botones */}
                                    <div className="d-flex justify-content-between align-items-center bg-light rounded p-1">

                                        {/* ➖ BOTÓN RESTAR */}
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="rounded-circle btn-carrito"
                                            // Al hacer click, llama a la función de restar que creaste en el Context
                                            onClick={() => decrementarCantidad(item.id, item.variante)}
                                        >
                                            -
                                        </Button>

                                        {/* NÚMERO DE CANTIDAD ACTUAL */}
                                        <span className="fw-bold mx-3">{item.cantidad}</span>

                                        {/* ➕ BOTÓN SUMAR */}
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="rounded-circle btn-carrito"
                                            // Al hacer click, suma 1 (reusa la función de agregar)
                                            onClick={() => agregarAlCarrito(item)}
                                        >
                                            +
                                        </Button>

                                        {/* 🗑️ BOTÓN ELIMINAR (Separado a la derecha) */}
                                        <Button
                                            variant="link"
                                            className="text-danger text-decoration-none ms-auto"
                                            size="sm"
                                            onClick={() => eliminarDelCarrito(item.id, item.variante)}
                                        >
                                            🗑️
                                        </Button>
                                    </div>

                                </ListGroup.Item>
                            ))}
                        </ListGroup>

                        {/* --- TOTAL Y BOTÓN DE PAGAR --- */}
                        <div className="border-top pt-3 mt-3">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="fs-4">Total:</span>
                                <span className="fs-4  TextSuccess">${total}</span>
                            </div>

                            <div className="d-grid gap-2">
                                <Button
                                    as={Link}
                                    to="/checkout"
                                    className='Iniciarcompra'
                                    size="lg"
                                    onClick={handleClose}
                                >
                                    Comprar
                                </Button>
                                <Button className='Vaciarcarrito' size="sm" onClick={vaciarCarrito}>
                                    Vaciar Carrito
                                </Button>
                            </div>
                        </div>
                    </>
                )}

            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default CartSidebar;