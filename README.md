# 🍕 GranPastini - E-commerce para Restaurantes

[![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge)](https://granpastini-27f3f.web.app/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> E-commerce completo y funcional para restaurantes, desarrollado con React, Firebase y Bootstrap. Permite a los clientes explorar el menú, personalizar pedidos y gestionar compras, mientras los administradores controlan productos y pedidos desde un panel seguro.

---

## 📋 Tabla de Contenidos

- [Demo](#-demo)
- [Características](#-características)
- [Tech Stack](#️-tech-stack)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Arquitectura](#️-arquitectura)
- [Seguridad](#-seguridad)
- [Roadmap](#️-roadmap)
- [Aprendizajes](#-aprendizajes)
- [Autor](#-autor)
- [Licencia](#-licencia)

---

## 🌐 Demo

### Ver en Vivo
👉 **[granpastini-27f3f.web.app](https://granpastini-27f3f.web.app/)**

### Credenciales de Prueba
Para acceder al panel de administración (solo con fines de demostración):
```
Email: demo@granpastini.com
Password: [Contactar para credenciales]
```

---

## ✨ Características

### Para Clientes:
- 🛒 **Carrito de compras inteligente** con persistencia de estado
- 🍕 **Selector de tamaños dinámico** (Grande/Media) con precios ajustables
- 🏷️ **Filtros por categoría** (Pizzas, Empanadas, Bebidas, etc.)
- 📱 **Diseño 100% responsive** - Optimizado para móvil, tablet y desktop
- 💳 **Proceso de checkout** completo con resumen del pedido
- ⚡ **Actualizaciones en tiempo real** gracias a Firestore
- 🎨 **Interfaz moderna** con animaciones y micro-interacciones

### Para Administradores:
- 🔐 **Autenticación segura** con Firebase Auth
- 👨‍💼 **Panel de administración completo**
- ➕ **Gestión de productos** (Crear, Editar, Eliminar)
- 📊 **Dashboard con métricas** de uso y ventas
- 🔒 **Reglas de seguridad** implementadas en Firestore
- 👥 **Sistema de roles** (Admin/Cliente)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Biblioteca UI con Hooks
- **Vite** - Build tool ultrarrápido
- **React Router v6** - Navegación SPA
- **Bootstrap 5** - Framework CSS
- **React Bootstrap** - Componentes React de Bootstrap
- **Context API** - State management global

### Backend & Database
- **Firebase Authentication** - Sistema de autenticación
- **Cloud Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Hosting** - Deploy y hosting
- **Firebase Security Rules** - Reglas de seguridad

### Herramientas
- **Git** - Control de versiones
- **VS Code** - Editor de código
- **npm** - Gestor de paquetes
- **ESLint** - Linter de código

---


## 🚀 Instalación

### Prerequisitos
- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Firebase

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/LautaroPujol/granpastini.git
cd granpastini
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_KEY=tu_api_key
VITE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_PROJECT_ID=tu_proyecto_id
VITE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_MESSAGING_SENDER_ID=tu_sender_id
VITE_APP_ID=tu_app_id
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Firebase Setup

1. **Crear proyecto en Firebase Console**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Habilita Authentication (Email/Password)
   - Crea una base de datos Firestore

2. **Configurar Firestore Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

3. **Crear usuario administrador**
   - En Firestore, crea una colección `admins`
   - Agrega un documento con el UID del usuario admin
   - Campos: `email` y `role: "admin"`

---

## 💻 Uso

### Como Cliente:
1. Navega por el catálogo de productos
2. Usa los filtros para encontrar lo que buscas
3. Selecciona tamaño (Grande/Media) si está disponible
4. Agrega productos al carrito
5. Revisa tu pedido en el sidebar
6. Completa el checkout

### Como Administrador:
1. Inicia sesión con credenciales de admin
2. Accede al panel de administración
3. Gestiona productos (Crear, Editar, Eliminar)
4. Revisa métricas en el dashboard

---

## 🏗️ Arquitectura

### Estructura del Proyecto
```
granpastini/
├── public/                 # Archivos públicos
├── src/
│   ├── Components/         # Componentes reutilizables
│   │   ├── CartSideBar/   # Sidebar del carrito
│   │   ├── Navbar/        # Navegación
│   │   └── ...
│   ├── Context/           # Context API
│   │   └── CartContext.jsx
│   ├── pages/             # Páginas principales
│   │   ├── Home/          # Catálogo de productos
│   │   ├── Admin/         # Panel de administración
│   │   ├── Checkout/      # Proceso de compra
│   │   └── Login/         # Autenticación
│   ├── services/          # Configuración de servicios
│   │   └── firebaseConfig.js
│   ├── App.jsx            # Componente raíz
│   └── main.jsx           # Punto de entrada
├── .env                   # Variables de entorno
├── vite.config.js         # Configuración de Vite
└── package.json           # Dependencias
```

### Flujo de Datos
```
Usuario → Componente → Context API → Firebase → Firestore
                          ↓
                    Estado Global
                          ↓
                  Actualización UI
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad:

1. **Autenticación Robusta**
   - Firebase Authentication con email/password
   - Sesiones seguras con tokens JWT
   - Cierre de sesión automático

2. **Reglas de Firestore**
   - Lectura pública de productos
   - Escritura solo para administradores
   - Validación de permisos en cada operación

3. **Protección de Rutas**
   - Rutas privadas con HOC
   - Redirección automática si no autenticado
   - Verificación de roles

4. **Variables de Entorno**
   - Credenciales en archivos .env
   - .env excluido de Git
   - Configuración segura en producción

---

## 🗺️ Roadmap

### Funcionalidades Planeadas:

- [ ] **Integración de Pagos**
  - MercadoPago / Stripe
  - Múltiples métodos de pago

- [ ] **Sistema de Pedidos Avanzado**
  - Tracking de pedidos en tiempo real
  - Notificaciones por email
  - Estado del pedido (En preparación, Enviado, Entregado)

- [ ] **Mejoras en UX**
  - Modo oscuro
  - Favoritos de productos
  - Historial de pedidos

- [ ] **Analytics**
  - Dashboard con gráficos
  - Reportes de ventas
  - Productos más vendidos

- [ ] **Optimizaciones**
  - Lazy loading de imágenes
  - PWA (Progressive Web App)
  - Optimización SEO

---

## 🎓 Aprendizajes

Este proyecto me permitió profundizar en:

### Habilidades Técnicas:
- ✅ Arquitectura de aplicaciones React modernas
- ✅ State management con Context API
- ✅ Integración completa con Firebase (Auth + Firestore)
- ✅ Diseño responsive y mobile-first
- ✅ Seguridad y autenticación en aplicaciones web
- ✅ Deploy y CI/CD con Firebase Hosting
- ✅ Gestión de rutas protegidas
- ✅ Manejo de estado complejo en carritos de compra

### Soft Skills:
- ✅ Resolución de problemas complejos
- ✅ Planificación y arquitectura de proyectos
- ✅ Debugging y testing
- ✅ Documentación de código
- ✅ Gestión de versiones con Git

### Conceptos de Negocio:
- ✅ Flujos de e-commerce
- ✅ UX en procesos de compra
- ✅ Gestión de inventario digital
- ✅ Roles y permisos de usuarios

---

## 👨‍💻 Autor

**Lautaro Pujol**

Frontend Developer especializado en React y JavaScript, actualmente expandiendo hacia Full Stack Development.

- 🌐 Portfolio: [lautaropujol.netlify.app](https://lautaropujol.netlify.app)
- 💼 LinkedIn: [Lautaro Pujol](https://linkedin.com/in/lautaropujol)
- 🐙 GitHub: [@LautaroPujol](https://github.com/LautaroPujol)
- 📧 Email: lautipujol99@gmail.com

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- Coderhouse por la formación en desarrollo web
- Comunidad de React por los recursos
- Firebase por la plataforma robusta
- Bootstrap por el framework CSS

---

## 📞 Contacto

¿Preguntas sobre el proyecto? ¿Interesado en colaborar?

**¡Contáctame!**
- Email: lautipujol99@gmail.com
- LinkedIn: [Lautaro Pujol](https://linkedin.com/in/lautaropujol)

---

<div align="center">

### ⭐ Si te gustó el proyecto, dale una estrella

**Desarrollado con ❤️ por Lautaro Pujol**

</div>