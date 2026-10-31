const Usuario = require("../models/Usuario");
const Coartada = require("../models/Coartada");
const Situacion = require("../models/Situacion");

const SIETE_DIAS_EN_MILISEGUNDOS = 7 * 24 * 60 * 60 * 1000;

async function listarUsuarios() {
  return await Usuario.find().populate("gremio", "nombre");
}

async function listarAliases(){
  return await Usuario.find().select("alias especialidad").sort({ alias: 1 });
}

async function obtenerPerfil(id){
  return await Usuario.findById(id).populate("gremio", "nombre descripcion");
}

async function cambiarRol(id, role, solicitanteId) {
  if (String(id) === String(solicitanteId)) {
    throw { status: 400, message: "No puedes cambiar tu propio rol" };
  }
  const usuario = await Usuario.findById(id);
  if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
  usuario.role = role;
  await usuario.save();
  return usuario;
}

// Elimina al usuario y limpia todo lo que dependía de él 
async function eliminarUsuario(id, solicitanteId) {
  if (String(id) === String(solicitanteId)) {
    throw { status: 400, message: "No puedes eliminar tu propia cuenta" };
  }
  const usuario = await Usuario.findById(id);
  if (!usuario) throw { status: 404, message: "Usuario no encontrado" };

  await Coartada.deleteMany({ autor: usuario._id });
  await Coartada.updateMany(
    {},
    { $pull: { testigos: usuario._id, marcasFalsas: usuario._id, votos: { usuario: usuario._id } } },
  );
  await Situacion.updateMany({}, { $pull: { solicitudes: { usuario: usuario._id } } });
  await usuario.deleteOne();
}

// Suma/resta puntos de credibilidad, y si queda negativa (y no tiene un
// bloqueo vigente) bloquea al usuario por 7 días.
async function modificarCredibilidad(usuarioId, cambio) {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) return;

  usuario.credibilidad = usuario.credibilidad + cambio;

  const bloqueoVigente =
    usuario.bloqueadoHasta && new Date(usuario.bloqueadoHasta).getTime() > Date.now();

  if (usuario.credibilidad < 0 && !bloqueoVigente) {
    usuario.bloqueadoHasta = new Date(Date.now() + SIETE_DIAS_EN_MILISEGUNDOS);
  }

  await usuario.save();
  return usuario;
}

function puedeCrearCoartada(usuario) {
  if (!usuario.bloqueadoHasta) return true;
  return Date.now() > new Date(usuario.bloqueadoHasta).getTime();
}

module.exports = {listarUsuarios, listarAliases, obtenerPerfil, cambiarRol, eliminarUsuario, modificarCredibilidad, puedeCrearCoartada};