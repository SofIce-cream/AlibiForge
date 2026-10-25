function errorHandler(err, req, res, next) {
  console.error("Error:", err.message || err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID inválido en la base de datos" });
  }

  if (err.code === 11000) {
    return res
      .status(400)
      .json({ error: "El correo o dato ya existe en la base de datos" });
  }

  const statusCode = err.status || err.statusCode || 500;
  const mensaje = err.message || "Error interno del servidor, intente más tarde";

  return res.status(statusCode).json({ error: mensaje });
}

module.exports = errorHandler;
