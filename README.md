# 🕵️‍♂️ AlibiForge — Fábrica Colaborativa de Coartadas (Full-Stack)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v5-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)
![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**AlibiForge** es una plataforma web Full-Stack diseñada para que los estudiantes puedan fabricar, compartir, auditar y sostener coartadas de forma colaborativa para justificar ausencias en clase, entregas tardías o salidas improvisadas. 

El sistema calcula dinámicamente un **Índice de Credibilidad** basado en la complejidad de la historia (detalles ancla), la red de testigos que respaldan la versión (*Alibi Chain*) y las votaciones de la comunidad, premiando a los mejores en el ranking *Master of Deceit* y penalizando las coartadas expuestas como falsas.

---

## 🌐 Despliegue y Documentación en Producción
- **🔗 API Base (Render):** [https://alibiforge.onrender.com/](https://alibiforge.onrender.com/)
- **📖 Documentación Interactiva (Swagger UI):** [https://alibiforge.onrender.com/api-docs/](https://alibiforge.onrender.com/api-docs/)

---

## 🎯 Alcance y Características Principales

1. **Autenticación y Perfiles Encubiertos:**
   - Registro e inicio de sesión seguro mediante JWT y contraseñas encriptadas (porque un verdadero maestro del engaño nunca usa su nombre real, sino un **alias**).
   - Especialidades de usuario: *Excusa Creativa*, *Detallista*, *Improvisador* o *Conspirador*.
   - Puntuación de credibilidad dinámica (inicia en `0`) y control de acceso basado en roles (RBAC).
2. **Fabricación de Coartadas y Máquina de Estados:**
   - Creación de coartadas con título, situación objetivo, historia (máx. 500 caracteres) y mínimo **3 detalles ancla** (*anchor details*).
   - Flujo de estados: `Draft` ➔ `Submitted` ➔ `UnderReview` ➔ `Approved` / `Rejected`.
3. **Alibi Chain (Coartadas en Cadena):**
   - Múltiples usuarios pueden unirse como **testigos** a una coartada existente para sostener la misma historia y elevar su índice de credibilidad.
   - Sistema de **deserción**: si un testigo abandona la cadena, traiciona al grupo y penaliza tanto al autor como a los testigos restantes.
4. **Foro de Situaciones de Riesgo:**
   - Clasificación y búsqueda de coartadas según la ocasión (*"Llegué tarde al parcial"*, *"No hice el proyecto"*, *"Necesito salir de clase"*), ordenadas por su Índice de Credibilidad.
5. **Sistema de Votación y Exposición:**
   - Evaluación única por usuario en tres dimensiones (escala 1 a 5): **Credibilidad**, **Creatividad** y **Consistencia**.
   - **Caza de mentiras:** los usuarios pueden marcar una coartada como falsa; al acumular 3 marcas, la coartada queda expuesta (`Rejected`) y su autor es sancionado.
6. **Rankings "Master of Deceit":**
   - Tablas de clasificación en tiempo real para *Master of Deceit*, *Most Creative*, *Most Consistent* y *Most Wanted*.

---

## 📐 Arquitectura del Proyecto (Monorepo)

El repositorio unifica tanto el servidor API RESTful (**Backend** con arquitectura en capas) como la aplicación cliente (**Frontend**):

```text
AlibiForge/
├── Backend/                 # API RESTful (Node.js + Express + MongoDB)
│   ├── config/              # Configuración y conexión a MongoDB Atlas (db.js)
│   ├── controllers/         # Controladores de la capa HTTP
│   │   ├── authControllers.js
│   │   ├── coartadaController.js
│   │   └── rankingController.js
│   ├── middleware/          # Autenticación JWT, roles (RBAC), validaciones y errorHandler
│   ├── models/              # Esquemas de Mongoose y máquina de estados
│   │   ├── Usuario.js       # alias, password, especialidad, credibilidad, bloqueadoHasta, role
│   │   └── Coartada.js      # titulo, situacion, historia, detalles, testigos, votos, marcasFalsas
│   ├── routes/              # Definición de endpoints REST y anotaciones Swagger
│   ├── services/            # Lógica de negocio desacoplada
│   │   ├── authService.js
│   │   ├── usuarioService.js    # Gestión de credibilidad y bloqueos temporales
│   │   ├── coartadaService.js   # CRUD, Alibi Chain, algoritmo de índice, exposición
│   │   └── rankingService.js    # Cálculo de los 4 rankings principales
│   ├── utils/               # Utilidades auxiliares (asyncHandler)
│   ├── app.js               # Configuración de Express, CORS, middlewares y Swagger UI
│   ├── index.js             # Punto de entrada del servidor
│   └── package.json
│
└── Frontend/                # Cliente Web (SPA)
    ├── public/              # Recursos estáticos
    ├── src/                 # Componentes, vistas, servicios de API, contexto de autenticación
    ├── index.html           # Plantilla principal
    ├── vite.config.js       # Configuración de empaquetado
    └── package.json
