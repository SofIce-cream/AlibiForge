const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

async function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrados" });
    }

    req.usuario = usuario;
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(500).json({ error: "Error al autenticar usuario" });
  }
}

function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!roles.includes(req.usuario.role)) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para realizar esta acción" });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
