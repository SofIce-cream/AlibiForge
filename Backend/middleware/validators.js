const { body, validationResult } = require("express-validator");

function verificarValidaciones(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const primerError = errors.array()[0];
    return res.status(400).json({
      error: primerError.msg,
      field: primerError.path || primerError.param,
      status: 400,
    });
  }
  next();
}

// Reglas para registrar usuario
const validarRegistro = [
  body("alias")
    .trim()
    .notEmpty()
    .withMessage("El alias es obligatorio")
    .isLength({ min: 3, max: 30 })
    .withMessage("El alias debe tener entre 3 y 30 caracteres"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("especialidad")
    .optional()
    .isIn(["Excusa Creativa", "Detallista", "Improvisador", "Conspirador"])
    .withMessage("Especialidad inválida"),
  verificarValidaciones,
];

// Reglas para el login
const validarLogin = [
  body("alias").trim().notEmpty().withMessage("El alias es obligatorio"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  verificarValidaciones,
];

// Reglas para crear/actualizar coartadas
const validarCoartada = [
  body("titulo")
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("El título debe tener entre 3 y 100 caracteres"),
  body("situacion").trim().notEmpty().withMessage("La situación es obligatoria"),
  body("historia")
    .trim()
    .notEmpty()
    .withMessage("La historia es obligatoria")
    .isLength({ max: 500 })
    .withMessage("La historia no puede superar los 500 caracteres"),
  body("detalles")
    .isArray({ min: 3 })
    .withMessage("La coartada debe tener al menos 3 detalles"),
  body("estado")
    .optional()
    .isIn(["Draft", "Submitted", "UnderReview", "Rejected", "Approved"])
    .withMessage("Estado inválido"),
  verificarValidaciones,
];

// Reglas para votar una coartada
const validarVoto = [
  body("credibilidad").isInt({ min: 1, max: 5 }).withMessage("La credibilidad debe estar entre 1 y 5"),
  body("creatividad").isInt({ min: 1, max: 5 }).withMessage("La creatividad debe estar entre 1 y 5"),
  body("consistencia").isInt({ min: 1, max: 5 }).withMessage("La consistencia debe estar entre 1 y 5"),
  verificarValidaciones,
];

module.exports = {
  verificarValidaciones,
  validarRegistro,
  validarLogin,
  validarCoartada,
  validarVoto,
};