# 📋 TaskFlow API - Backend RESTful

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v4-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)
![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

API RESTful desarrollada con **Node.js**, **Express** y **MongoDB / Mongoose** para la gestión centralizada de usuarios y tareas (**TaskFlow**). Incorpora autenticación por tokens JWT, control de acceso basado en roles (RBAC), validaciones con `express-validator`, manejo global de errores y documentación interactiva con Swagger UI.

---

## 🌐 API Desplegada en Producción
- **URL Base:** https://backend-sk85.onrender.com
- **Documentación Swagger:** https://backend-sk85.onrender.com/api-docs

---

## 📐 Arquitectura del Proyecto

El proyecto sigue el patrón de **arquitectura en capas (Layered Architecture)** para garantizar una separación clara de responsabilidades y un código mantenible:

```text
Backend/
├── config/             # Configuración y conexión a MongoDB (db.js)
├── controllers/        # Controladores (manejo de peticiones HTTP)
├── middleware/         # Middlewares (JWT, roles, validaciones, errorHandler)
├── models/             # Esquemas de Mongoose con validaciones
├── routes/             # Definición de rutas y endpoints
├── services/           # Lógica de negocio desacoplada de la capa HTTP
├── utils/              # Utilidades auxiliares (asyncHandler)
├── .env.example        # Plantilla de variables de entorno requeridas
├── .gitignore          # Exclusión de archivos sensibles (node_modules, .env)
├── app.js              # Configuración global, middlewares y Swagger UI
├── index.js            # Punto de entrada y arranque del servidor
└── package.json        # Dependencias y scripts del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

- **Runtime:** Node.js (v18+)
- **Framework Web:** Express.js
- **Base de Datos:** MongoDB Atlas & Mongoose ORM
- **Seguridad:** JSON Web Tokens (JWT) & BcryptJS
- **Validaciones:** express-validator
- **Documentación:** Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/SofIce-cream/Backend
cd Backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Define los valores en tu archivo `.env`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 4. Iniciar el servidor
```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

---

## 🔑 Endpoints de la API

### 🛡️ Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registrar` | Registrar un nuevo usuario | Público |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener token JWT | Público |

### 👤 Usuarios (`/api/usuarios`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/usuarios` | Listar todos los usuarios | Admin |
| `PUT` | `/api/usuarios/:id/rol` | Cambiar el rol de un usuario | Admin |
| `DELETE` | `/api/usuarios/:id` | Eliminar un usuario | Admin |

### 📝 Tareas (`/api/tareas`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tareas` | Listar tareas (Admin ve todas, User solo las suyas) | Autenticado |
| `POST` | `/api/tareas` | Crear una nueva tarea vinculada al usuario | Autenticado |
| `GET` | `/api/tareas/:id` | Obtener detalle de una tarea por ID | Propietario / Admin |
| `PUT` | `/api/tareas/:id` | Actualizar una tarea existente | Propietario / Admin |
| `DELETE` | `/api/tareas/:id` | Eliminar una tarea | Propietario / Admin |

### 🎲 Trivia (`/api/trivia`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trivia` | Obtener preguntas de trivia desde API externa | Público |

---

## 📖 Documentación Interactiva (Swagger UI)

La especificación completa OpenAPI 3.0 con soporte interactivo para probar endpoints (`Try it out`) y autenticación Bearer Token se encuentra disponible en:

👉 **[https://backend-sk85.onrender.com/api-docs](https://backend-sk85.onrender.com/api-docs)**

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
