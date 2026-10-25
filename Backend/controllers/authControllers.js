const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const registrar = asyncHandler(async (req, res) => {
  const { usuario, token } = await authService.registrar(req.body);
  res
    .status(201)
    .json({ mensaje: "Usuario registrado correctamente", usuario, token });
});

const login = asyncHandler(async (req, res) => {
  const { usuario, token } = await authService.login(req.body);
  res.status(200).json({ mensaje: "Inicio de sesión exitoso", usuario, token });
});

module.exports = { registrar, login };
