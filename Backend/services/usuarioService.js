const Usuario = require("../models/Usuario");

const SIETE_DIAS_EN_MILISEGUNDOS = 7 * 24 * 60 * 60 * 1000;

async function listarUsuarios() {
  return await Usuario.find();
}

async function cambiarRol(id, role) {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
  usuario.role = role;
  await usuario.save();
  return usuario;
}

async function eliminarUsuario(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
  await usuario.deleteOne();
}

// Misma lógica que utils/usuarios.js del frontend:
// suma/resta puntos de credibilidad, y si queda negativa (y aún no estaba
// bloqueado) bloquea al usuario por 7 días.
async function modificarCredibilidad(usuarioId, cambio) {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) return;

  usuario.credibilidad = usuario.credibilidad + cambio;

  if (usuario.credibilidad < 0 && !usuario.bloqueadoHasta) {
    usuario.bloqueadoHasta = new Date(Date.now() + SIETE_DIAS_EN_MILISEGUNDOS);
  }

  await usuario.save();
  return usuario;
}

function puedeCrearCoartada(usuario) {
  if (!usuario.bloqueadoHasta) return true;
  return Date.now() > new Date(usuario.bloqueadoHasta).getTime();
}

module.exports = {
  listarUsuarios,
  cambiarRol,
  eliminarUsuario,
  modificarCredibilidad,
  puedeCrearCoartada,
};