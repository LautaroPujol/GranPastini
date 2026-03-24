import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const carritoInicial = JSON.parse(localStorage.getItem('carrito')) || [];
  
  const [carrito, setCarrito] = useState(carritoInicial);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    const nuevoTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    setTotal(nuevoTotal);
  }, [carrito]);

  // --- SUMAR (+1) ---
  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find(item => item.id === producto.id && item.variante === producto.variante);
      if (existe) {
        return prevCarrito.map(item => 
          (item.id === producto.id && item.variante === producto.variante)
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCarrito, { ...producto, cantidad: 1 }];
      }
    });
  };

  // --- RESTAR (-1) 👇 ESTA ES LA NUEVA FUNCIÓN ---
  const decrementarCantidad = (id, variante) => {
    setCarrito(prevCarrito => {
      return prevCarrito.map(item => {
        // Encontramos el item
        if (item.id === id && item.variante === variante) {
          // Le restamos 1
          return { ...item, cantidad: item.cantidad - 1 };
        }
        return item;
      }).filter(item => item.cantidad > 0); 
    });
  };

  // --- BORRAR ITEM COMPLETO (Tacho de basura) ---
  const eliminarDelCarrito = (id, variante) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => !(item.id === id && item.variante === variante)));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CartContext.Provider value={{ 
        carrito, 
        total, 
        agregarAlCarrito, 
        decrementarCantidad, 
        eliminarDelCarrito, 
        vaciarCarrito 
    }}>
      {children}
    </CartContext.Provider>
  );
};