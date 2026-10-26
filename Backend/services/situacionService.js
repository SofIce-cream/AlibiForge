const Situacion = require("../models/Situacion");
const Coartada = require("../models/Coartada");
const coartadaService = require("./coartadaService");

const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ESTADOS_PUBLICOS = ["Submitted", "UnderReview", "Approved"];

// Mejores coartadas de una situación, ordenadas por Índice de credibilidad
async function topCoartadas(titulo, usuarioActual, limite = 10) {
  const coartadas = await Coartada.find({
    situacion: new RegExp(`^${escapar(titulo)}$`, "i"),
    estado: { $in: ESTADOS_PUBLICOS },
  })
    .populate("autor", "alias especialidad")
    .populate("testigos", "alias")
    .populate("votos.usuario", "alias")
    .populate("marcasFalsas", "alias");

  return coartadas
    .map((c) => coartadaService.presentar(c, usuarioActual))
    .sort((a, b) => b.indice - a.indice)
    .slice(0, limite);
}

async function listarSituaciones() {
  const situaciones = await Situacion.find().sort({ titulo: 1 }).populate("creador", "alias");
  const resultado = [];
  for (const situacion of situaciones) {
    const cantidad = await Coartada.countDocuments({
      situacion: new RegExp(`^${escapar(situacion.titulo)}$`, "i"),
      estado: { $in: ESTADOS_PUBLICOS },
    });
    resultado.push({
      ...situacion.toObject(),
      solicitudes: undefined,
      totalSolicitudes: situacion.solicitudes.length,
      totalCoartadas: cantidad,
    });
  }
  return resultado;
}

async function obtenerSituacion(id, usuarioActual) {
  const situacion = await Situacion.findById(id)
    .populate("creador", "alias")
    .populate("solicitudes.usuario", "alias");
  if (!situacion) throw { status: 404, message: "Situación no encontrada" };

  return {
    ...situacion.toObject(),
    topCoartadas: await topCoartadas(situacion.titulo, usuarioActual),
  };
}

async function crearSituacion({ titulo, descripcion }, usuarioActual) {
  const existente = await Situacion.findOne({
    titulo: new RegExp(`^${escapar(titulo.trim())}$`, "i"),
  });
  if (existente) throw { status: 400, message: "Ya existe una situación con ese título" };

  return await Situacion.create({
    titulo,
    descripcion,
    creador: usuarioActual._id,
  });
}

// Un usuario pide una coartada para una situación 
async function solicitarCoartada(id, mensaje, usuarioActual) {
  const situacion = await Situacion.findById(id);
  if (!situacion) throw { status: 404, message: "Situación no encontrada" };

  const yaSolicito = situacion.solicitudes.some(
    (s) => s.usuario.toString() === usuarioActual._id.toString(),
  );
  if (yaSolicito) {
    throw { status: 400, message: "Ya solicitaste una coartada para esta situación" };
  }

  situacion.solicitudes.push({ usuario: usuarioActual._id, mensaje: mensaje || "" });
  await situacion.save();
  return await obtenerSituacion(id, usuarioActual);
}

module.exports = { listarSituaciones, obtenerSituacion, crearSituacion, solicitarCoartada };