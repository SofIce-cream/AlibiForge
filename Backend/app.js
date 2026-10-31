const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const authRouter = require("./routes/auth");
const coartadasRouter = require("./routes/coartadas");
const usuariosRouter = require("./routes/usuarios");
const rankingsRouter = require("./routes/rankings");
const errorHandler = require("./middleware/errorHandler");
const situacionesRouter = require("./routes/situaciones");
const gremiosRouter = require("./routes/gremios");

const app = express();

// CORS_ORIGIN: URL(s) del frontend separadas por coma. 
const origenesPermitidos = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""))
  : true;
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // para parsear el body de las peticiones
app.use("/api/situaciones", situacionesRouter);
app.use("/api/gremios", gremiosRouter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const swaggerOption = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "AlibiForge API",
      version: "1.0.0",
      description: "API Restful para la fabricación y validación de coartadas, con roles y autenticación JWT",
    },
    servers: [
      {
        url: process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.PUBLIC_API_URL ? "Producción (Render)" : "Local Host",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOption);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    mensaje: "API DE ALIBIFORGE",
    version: "1.0.0",
    documentacion: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      coartadas: "/api/coartadas",
      usuarios: "/api/usuarios",
      rankings: "/api/rankings",
      situaciones: "/api/situaciones",
      gremios: "/api/gremios",
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/coartadas", coartadasRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/rankings", rankingsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada, petición no existe" });
});

app.use(errorHandler);

module.exports = app;