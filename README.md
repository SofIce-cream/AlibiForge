# 🕵️‍♂️ AlibiForge — Fábrica Colaborativa de Coartadas (Full-Stack)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v5-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)
![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)
![Netlify](https://img.shields.io/badge/Deploy-Netlify%20%2B%20Render-00C7B7.svg)

**AlibiForge** es una plataforma web Full-Stack donde los estudiantes crean, comparten, votan y sostienen coartadas de forma colaborativa. El sistema calcula un **Índice de Credibilidad** a partir de la complejidad de la historia (detalles ancla), la red de testigos (*Alibi Chain*) y las votaciones de la comunidad.

---

## 🌐 Despliegue y documentación en producción

| Servicio | Plataforma | Enlace público |
| :--- | :--- | :--- |
| 💻 **Aplicación web (Frontend)** | Netlify | **https://alibiforge.netlify.app/** |
| ⚙️ **API (Backend)** | Render | **https://alibiforge.onrender.com/** |
| 📖 **Swagger UI** | Render | **https://alibiforge.onrender.com/api-docs/** |

> **Nota sobre Render:** el servidor se duerme tras 15 minutos sin uso. La primera petición puede tardar entre 45 y 60 segundos.

---

## 🔑 Credenciales de prueba

Todas las cuentas usan la contraseña `HelloWorld*29`.

| Rol | Alias | Qué probar |
| :--- | :--- | :--- |
| 🛡️ **Administrador** | `Director` | Panel de **Administración**, moderación de estados (`UnderReview` → `Approved`/`Rejected`), gestión de usuarios y de situaciones del foro. |
| 👤 **Usuario estándar** | `ShadowHuntress` | Crear, editar, eliminar coartadas propias, votar, ser testigo / desertar. |
| 👤 **Usuario estándar** | `TomatoSoup` | Pruebas cruzadas de votos, marcas de falsedad y cadenas. |
| 🚫 **Usuario bloqueado** | `Cowfarm` | Regla de negocio: credibilidad < 0 ⇒ no puede crear coartadas durante 7 días. |

---

## 🎯 Funcionalidades

1. **Autenticación end-to-end:** registro, login y logout con JWT y contraseñas cifradas con `bcryptjs`. Un **interceptor de Axios** adjunta el token en cada petición y, si el servidor responde 401, cierra la sesión automáticamente. El estado de sesión se gestiona con **Context API** (`AuthContext`).
2. **Roles y permisos (RBAC):** `user` y `admin`. El frontend oculta o muestra vistas según el rol (menú, ruta `/admin`, botones de moderación y edición del foro) y el backend vuelve a validar el rol en cada endpoint protegido.
3. **Coartadas (CRUD completo):** crear (título, situación, historia ≤ 500 caracteres, mínimo 3 detalles ancla, testigos), listar con filtro, **editar borradores** y eliminar. Cada edición guarda la **versión anterior**, visible en la tarjeta ("Versiones anteriores").
4. **Máquina de estados:** `Draft` → `Submitted` → `UnderReview` → `Approved` / `Rejected`.
5. **Votación:** un voto por usuario y coartada (credibilidad, creatividad y consistencia, de 1 a 5). El autor no puede votar su propia coartada.
6. **Índice de Credibilidad:** `(promedio × 10) + (testigos × 2) + complejidad` (3+ detalles = +5, 5+ = +10, 10+ = +20). Se recalcula con cada voto o cambio de testigos.
7. **Alibi Chain:** unirse como testigo o desertar; al desertar se penaliza al autor y a los testigos restantes.
8. **Exposición y sanciones:** 3 marcas de falsedad ⇒ la coartada pasa a `Rejected` y el autor pierde 10 puntos. Con credibilidad < 0 no puede crear coartadas durante 7 días.
9. **Foro de situaciones:** crear situaciones, ver el top de coartadas por índice y solicitar una coartada. El administrador puede editar y eliminar situaciones.
10. **Rankings:** *Master of Deceit*, *Most Creative*, *Most Consistent* y *Most Wanted*.
11. **Panel de administración:** moderación de coartadas pendientes, cambio de rol y eliminación de usuarios.
12. **Gestión de estados:** indicadores de carga, mensajes de error de la API en pantalla y validación de formularios.

---

## 📐 Arquitectura (monorepo)

```text
AlibiForge2/
├── Backend/                        # API REST (Node.js + Express + MongoDB Atlas)
│   ├── config/db.js                # Conexión a MongoDB con Mongoose
│   ├── controllers/                # Peticiones y respuestas HTTP
│   ├── middleware/                 # auth (JWT + roles), errorHandler, validators
│   ├── models/                     # Usuario, Coartada, Gremio, Situacion
│   ├── routes/                     # Rutas REST + documentación Swagger
│   ├── services/                   # Lógica de negocio (índice, sanciones, estados)
│   ├── utils/                      # Credibilidad, estados, asyncHandler
│   ├── datosEjemplo.js             # Datos de prueba SIN borrar nada (usar en producción)
│   ├── seed.js                     # ⚠ BORRA toda la base y la repuebla (solo desarrollo)
│   ├── app.js / index.js           # Configuración de Express y arranque del servidor
│   └── .env.example
│
├── Frontend/                       # SPA (React + Vite)
│   ├── public/                     # Recursos estáticos (favicon)
│   ├── src/
│   │   ├── api/                    # Cliente Axios, interceptores y funciones por endpoint
│   │   ├── context/                # AuthContext (sesión y rol)
│   │   ├── components/             # TarjetaCoartada, Mensaje
│   │   └── pages/                  # Login, Registro, Perfil, ListaCoartadas, CreateAlibi,
│   │                               # AlibiChain, Situaciones, Rankings, Admin
│   ├── index.html
│   ├── vite.config.js
│   └── .env.example
│
├── netlify.toml                    # Build y redirección SPA para Netlify
└── README.md
```

---

## 🚀 Instalación y ejecución en local

**Prerrequisitos:** Node.js v18+, npm, Git y una base MongoDB (local o Atlas).

### 1. Clonar el repositorio
```bash
git clone https://github.com/SofIce-cream/AlibiForge
cd AlibiForge2
```

### 2. Backend
```bash
cd Backend
npm install
```
Crea `Backend/.env` a partir de `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/alibiforge?retryWrites=true&w=majority
JWT_SECRET=una_clave_larga_y_aleatoria
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

Variables opcionales: `CORS_ORIGIN` (URL del frontend; si falta se acepta cualquier origen) y `PUBLIC_API_URL` (URL pública de la API, para que Swagger apunte a producción).

Carga los datos de prueba (3 gremios, usuarios, 15 coartadas, 30 votos y 5 cadenas) y arranca el servidor:
```bash
npm run datos:ejemplo
npm run dev
```
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

> ⚠️ `npm run seed` **borra todas las colecciones** antes de repoblar. Úsalo solo en desarrollo; en producción usa `npm run datos:ejemplo`.

### 3. Frontend
En otra terminal:
```bash
cd Frontend
npm install
```
Crea `Frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```
(Para usar el backend en producción: `VITE_API_URL=https://alibiforge.onrender.com`).

```bash
npm run dev
```
Abre `http://localhost:5173`.

---

## ☁️ Despliegue

- **Render (Backend):** Root Directory `Backend`, Build Command `npm install`, Start Command `npm start`. Variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`.
- **MongoDB Atlas:** en *Network Access* debe permitirse la IP de Render (por ejemplo `0.0.0.0/0`).
- **Netlify (Frontend):** usa el `netlify.toml` de la raíz. Variable obligatoria: `VITE_API_URL=https://alibiforge.onrender.com` (sin `/` final). Sin ella la app apunta a `localhost`.

---

## 📡 Mapeo de endpoints (API REST)

Todos los endpoints requieren la cabecera `Authorization: Bearer <token>`, salvo los marcados como **Público**.

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registrar` | Público | Registra un usuario (alias, contraseña, especialidad, gremio). |
| `POST` | `/api/auth/login` | Público | Autentica y devuelve el usuario y el token JWT. |

### 👤 Usuarios (`/api/usuarios`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/usuarios/me` | JWT | Perfil del usuario autenticado. |
| `GET` | `/api/usuarios/alias` | JWT | Alias disponibles (para elegir testigos). |
| `GET` | `/api/usuarios` | Admin | Lista todos los usuarios. |
| `PUT` | `/api/usuarios/:id/rol` | Admin | Cambia el rol (`admin` / `user`). |
| `DELETE` | `/api/usuarios/:id` | Admin | Elimina al usuario y sus datos asociados. |

### 🕵️ Coartadas y Alibi Chain (`/api/coartadas`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/coartadas` | JWT | Lista coartadas (los borradores solo los ven su autor y el admin). |
| `GET` | `/api/coartadas/:id` | JWT | Detalle de una coartada. |
| `POST` | `/api/coartadas` | JWT | Crea una coartada (valida el bloqueo de 7 días). |
| `PUT` | `/api/coartadas/:id` | Autor / Admin | Edita un borrador y guarda la versión anterior. |
| `DELETE` | `/api/coartadas/:id` | Autor / Admin | Elimina una coartada. |
| `PUT` | `/api/coartadas/:id/estado` | Autor / Admin | Cambia de estado según la máquina de estados. |
| `POST` | `/api/coartadas/:id/votar` | JWT | Vota credibilidad, creatividad y consistencia (1 a 5, una sola vez). |
| `POST` | `/api/coartadas/:id/testigo` | JWT | Se une a la cadena como testigo. |
| `DELETE` | `/api/coartadas/:id/testigo` | JWT | Deserta de la cadena (aplica penalización). |
| `POST` | `/api/coartadas/:id/marcar-falsa` | JWT | Marca como falsa; a la 3.ª marca queda rechazada. |
| `GET` | `/api/coartadas/:id/indice` | JWT | Desglose del Índice de Credibilidad. |

### 📌 Situaciones del foro (`/api/situaciones`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/situaciones` | JWT | Lista las situaciones con totales. |
| `GET` | `/api/situaciones/:id` | JWT | Detalle y top de coartadas por índice. |
| `POST` | `/api/situaciones` | JWT | Crea una situación. |
| `POST` | `/api/situaciones/:id/solicitar` | JWT | Solicita una coartada para esa situación. |
| `PUT` | `/api/situaciones/:id` | Admin | Edita título y descripción. |
| `DELETE` | `/api/situaciones/:id` | Admin | Elimina una situación. |

### 🏆 Rankings y gremios
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rankings` | JWT | Master of Deceit, Most Creative, Most Consistent y Most Wanted. |
| `GET` | `/api/gremios` | Público | Lista de gremios (se usa en el registro). |

---

## 🛠️ Tecnologías

- **Backend:** Node.js, Express 5, MongoDB Atlas, Mongoose, `jsonwebtoken`, `bcryptjs`, `express-validator`, `cors`, `dotenv`, `swagger-jsdoc` y `swagger-ui-express`.
- **Frontend:** React, Vite, React Router, **Axios** (con interceptores HTTP), **Context API** y Tailwind CSS.
- **Despliegue:** Render (Backend), Netlify (Frontend), MongoDB Atlas (base de datos), Git y GitHub.

---

## 📄 Licencia
Proyecto bajo licencia **MIT**. Desarrollado para la asignatura de **Ingeniería Web (Semestre 2026-2)**.
