const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

async function registrar({ alias, password, especialidad }) {
  const usuarioExistente = await Usuario.findOne({ alias });
  if (usuarioExistente)
    throw { status: 400, message: "Ese alias ya está en uso" };

  // El role SIEMPRE se asigna por defecto ("user") desde el modelo.
  const usuario = new Usuario({ alias, password, especialidad });

  await usuario.save();
  const token = generarToken(usuario);

  const usuarioObj = usuario.toObject();
  delete usuarioObj.password;

  return { usuario: usuarioObj, token };
}

async function login({ alias, password }) {
  const usuario = await Usuario.findOne({ alias }).select("+password");
  if (!usuario)
    throw { status: 401, message: "Alias o contraseña incorrectos" };

  const passwordValida = await usuario.compararPasswords(password);
  if (!passwordValida)
    throw { status: 401, message: "Alias o contraseña incorrectos" };

  const token = generarToken(usuario);

  const usuarioObj = usuario.toObject();
  delete usuarioObj.password;

  return { usuario: usuarioObj, token };
}

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario._id,
      alias: usuario.alias,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

module.exports = { registrar, login, generarToken };
// CORS
// Cross-Origin Resource Sharing
//  const cors = require("cors");
// app.use(cors());