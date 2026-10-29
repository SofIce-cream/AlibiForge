# 🕵️‍♂️ AlibiForge — Fábrica Colaborativa de Coartadas (Full-Stack)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v5-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)
![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)
![Netlify](https://img.shields.io/badge/Deploy-Netlify%20%2B%20Render-00C7B7.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**AlibiForge** es una plataforma web Full-Stack diseñada para que los estudiantes puedan fabricar, compartir, auditar y sostener coartadas de forma colaborativa para justificar ausencias en clase, entregas tardías o salidas improvisadas.

El sistema calcula dinámicamente un **Índice de Credibilidad** basado en la complejidad de la historia (detalles ancla), la red de testigos que respaldan la versión (*Alibi Chain*), los gremios de pertenencia y las votaciones de la comunidad, premiando a los mejores en el ranking *Master of Deceit* y penalizando las coartadas expuestas como falsas.

---

## 🌐 Despliegue y Documentación en Producción

| Entorno / Servicio | Plataforma | Enlace Público |
| :--- | :--- | :--- |
| 💻 **Aplicación Web (Frontend)** | Netlify | **[https://alibiforge.netlify.app/](https://alibiforge.netlify.app/)** |
| ⚙️ **API Base (Backend)** | Render | **[https://alibiforge.onrender.com/](https://alibiforge.onrender.com/)** |
| 📖 **Documentación Interactiva (Swagger UI)** | Render | **[https://alibiforge.onrender.com/api-docs/](https://alibiforge.onrender.com/api-docs/)** |

> **Nota sobre Render (Free Tier):** El servidor backend entra en modo de suspensión tras 15 minutos de inactividad. La primera petición puede tardar entre 45 y 60 segundos mientras el contenedor despierta.

---

## 🔑 Credenciales de Prueba (Entorno de Producción y Seed)

Para validar la autenticación End-to-End, el control de acceso basado en roles (**RBAC**) y las reglas de negocio, utiliza las siguientes cuentas preconfiguradas:

| Rol en el Sistema | Alias (Usuario) | Contraseña | Especialidad | Propósito de Prueba |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Administrador** | `Director` | `HelloWorld*29` | Conspirador | Moderación, cambio de estados (`Approved` / `Rejected`), gestión de situaciones y permisos administrativos. |
| 👤 **Usuario Estándar** | `ShadowHuntress` | `HelloWorld*29` | Excusa Creativa | Creación/edición de coartadas propias, votación, unirse/desertar de cadenas de testigos (*Alibi Chain*). |
| 👤 **Usuario Estándar** | `TomatoSoup` | `HelloWorld*29` | Excusa Creativa | Pruebas cruzadas de votos, marcas de falsedad y cadenas colaborativas. |
| 👤 **Usuario Estándar** | `PixelMonk` | `HelloWorld*29` | Detallista | Pruebas de coartadas en estado `Draft` y `Submitted`. |
| 🚫 **Usuario Bloqueado** | `Cowfarm` | `HelloWorld*29` | Excusa Creativa | **Regla de negocio:** Cuenta sancionada (-10 pts y bloqueo de 7 días) tras tener una coartada expuesta por 3 marcas falsas. |

---

## 🎯 Alcance y Características Principales

1. **Autenticación End-to-End y Perfiles Encubiertos:**
   - Registro, inicio y cierre de sesión seguro mediante **JWT** (almacenado y gestionado en el cliente con interceptores HTTP) y contraseñas encriptadas con `bcryptjs`.
   - Uso exclusivo de **alias** encubiertos, asignación de **Gremios** (*The Excuse Makers*, *The Detail Weavers*, *The Improvisers*) y especialidades (*Excusa Creativa*, *Detallista*, *Improvisador*, *Conspirador*).
   - Protección de rutas privadas y visualización adaptativa según el rol (`user` vs. `admin`).
2. **Fabricación de Coartadas (CRUD Completo) y Máquina de Estados:**
   - Creación, lectura, actualización y eliminación de coartadas con título, situación objetivo, historia (máx. 500 caracteres) y mínimo **3 detalles ancla** (*anchor details*).
   - Flujo de estados: `Draft` ➔ `Submitted` ➔ `UnderReview` ➔ `Approved` / `Rejected`.
3. **Alibi Chain (Coartadas en Cadena):**
   - Múltiples usuarios pueden unirse como **testigos** a una coartada existente para sostener la misma historia y elevar su índice de credibilidad.
   - Sistema de **deserción**: si un testigo abandona la cadena, traiciona al grupo y penaliza la credibilidad tanto del autor como de los testigos restantes.
4. **Foro de Situaciones de Riesgo:**
   - Gestión y clasificación de coartadas según la ocasión (*"Llegué tarde a un parcial"*, *"No hice un proyecto"*, *"Necesito salir de clase"*), filtrables y ordenadas por su Índice de Credibilidad.
5. **Sistema de Votación y Exposición (Caza de Mentiras):**
   - Evaluación única por usuario en tres dimensiones (escala 1 a 5): **Credibilidad**, **Creatividad** y **Consistencia** (los autores no pueden votar en sus propias coartadas).
   - **Exposición automática:** los usuarios pueden marcar una coartada como falsa; al acumular **3 marcas**, la coartada pasa a `Rejected` (`expuesta: true`), el autor pierde 10 puntos de credibilidad y queda bloqueado durante 7 días.
6. **Rankings "Master of Deceit":**
   - Tablas de clasificación dinámicas en tiempo real para *Master of Deceit*, *Most Creative*, *Most Consistent* y *Most Wanted*, además de estadísticas por gremio.

---

## 📐 Arquitectura del Proyecto (Monorepo)

El repositorio está estructurado como un **Monorepo** con entornos y dependencias independientes para el servidor API RESTful (**Backend**) y la aplicación cliente SPA (**Frontend**):

```text
AlibiForge2/
├── Backend/                        # API RESTful (Node.js + Express + MongoDB Atlas)
│   ├── config/
│   │   └── db.js                   # Conexión a MongoDB Atlas mediante Mongoose
│   ├── controllers/                # Controladores de peticiones y respuestas HTTP
│   │   ├── authControllers.js      # Registro, login y perfil del agente autenticado
│   │   ├── coartadaController.js   # CRUD de coartadas, votos, cadenas y marcas falsas
│   │   ├── rankingController.js    # Rankings individuales y por gremios
│   │   └── situacionController.js  # Gestión del catálogo de situaciones del foro
│   ├── middleware/                 # Capa intermedia de seguridad y validación
│   │   ├── auth.js                 # Verificación de token JWT y autorización por rol (RBAC)
│   │   ├── errorHandler.js         # Manejo centralizado y estructurado de excepciones
│   │   └── validators.js           # Reglas de validación con express-validator
│   ├── models/                     # Esquemas de datos y lógica de dominio en Mongoose
│   │   ├── Usuario.js              # alias, password, especialidad, gremio, credibilidad, role, bloqueadoHasta
│   │   ├── Coartada.js             # titulo, situacion, historia, detalles, estado, testigos, votos, marcasFalsas
│   │   ├── Gremio.js               # nombre, descripcion
│   │   └── Situacion.js            # titulo, creador
│   ├── routes/                     # Definición de rutas REST y documentación OpenAPI/Swagger
│   ├── services/                   # Lógica de negocio desacoplada (Índice de Credibilidad, sanciones)
│   ├── utils/                      # Utilidades auxiliares (asyncHandler, etc.)
│   ├── crearUsuariosPrueba.js      # Script auxiliar para creación rápida de usuarios base
│   ├── datosEjemplo.js             # Script Seeder completo (Gremios, 13 Usuarios, 10 Situaciones, 15 Coartadas)
│   ├── app.js                      # Configuración de Express, CORS, middlewares y Swagger UI
│   ├── index.js                    # Punto de entrada del servidor HTTP
│   ├── .env.example                # Plantilla de variables de entorno del servidor
│   └── package.json
│
├── Frontend/                       # Cliente Web SPA (React + Vite)
│   ├── public/                     # Recursos estáticos
│   ├── src/                        # Vistas, componentes modulares, Context API e interceptores HTTP
│   ├── index.html                  # Plantilla raíz de la aplicación
│   ├── netlify.toml                # Reglas de construcción y redirección SPA para Netlify
│   ├── vite.config.js              # Configuración de Vite
│   └── package.json
│
└── README.md                       # Documentación técnica del proyecto
