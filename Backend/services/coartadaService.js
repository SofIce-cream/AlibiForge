const Coartada = require("../models/Coartada");
const usuarioService = require("./usuarioService");

const PENALIZACION_POR_DESERCION = 5;
const PENALIZACION_POR_EXPOSICION = 10;
const VOTOS_NECESARIOS_PARA_EXPONER = 3;

// Cálculo del índice de credibilidad (igual a coartadas.js del frontend) 

function calcularComplejidad(coartada) {
  const cantidadDetalles = coartada.detalles.length;

  if (cantidadDetalles >= 10) return 20;
  if (cantidadDetalles >= 5) return 10;
  if (cantidadDetalles >= 3) return 5;
  return 0;
}

function calcularPromedioVotos(coartada) {
  if (coartada.votos.length === 0) return 0;

  let sumaPromedios = 0;
  coartada.votos.forEach((voto) => {
    sumaPromedios += (voto.credibilidad + voto.creatividad + voto.consistencia) / 3;
  });

  return sumaPromedios / coartada.votos.length;
}

function calcularIndiceCredibilidad(coartada) {
  const promedio = calcularPromedioVotos(coartada);
  const puntosPorTestigos = coartada.testigos.length * 2;
  const complejidad = calcularComplejidad(coartada);

  const indice = promedio * 10 + puntosPorTestigos + complejidad;

  return Math.round(indice * 10) / 10;
}

// CRUD 

async function listarCoartadas() {
  return await Coartada.find()
    .populate("autor", "alias especialidad")
    .populate("testigos", "alias");
}

async function obtenerCoartadaPorId(id) {
  const coartada = await Coartada.findById(id)
    .populate("autor", "alias especialidad")
    .populate("testigos", "alias");

  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };
  return coartada;
}

async function crearCoartada(data, usuarioActual) {
  const puedeCrear = usuarioService.puedeCrearCoartada(usuarioActual);
  if (!puedeCrear) {
    throw {
      status: 403,
      message: "Estás bloqueado: no puedes crear coartadas todavía.",
    };
  }

  const { titulo, situacion, historia, detalles, estado } = data;

  const detallesLlenos = (detalles || [])
    .map((d) => d.trim())
    .filter((d) => d !== "");

  const nuevaCoartada = new Coartada({
    titulo,
    situacion,
    historia,
    detalles: detallesLlenos,
    estado: estado === "Submitted" ? "Submitted" : "Draft",
    autor: usuarioActual._id,
  });

  await nuevaCoartada.save();
  return nuevaCoartada;
}

async function actualizarCoartada(id, data, usuarioActual) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  if (
    coartada.autor.toString() !== usuarioActual._id.toString() &&
    usuarioActual.role !== "admin"
  ) {
    throw { status: 403, message: "No tienes permisos para actualizar esta coartada" };
  }

  const { titulo, situacion, historia, detalles, estado } = data;

  if (titulo !== undefined) coartada.titulo = titulo;
  if (situacion !== undefined) coartada.situacion = situacion;
  if (historia !== undefined) coartada.historia = historia;
  if (detalles !== undefined) {
    coartada.detalles = detalles.map((d) => d.trim()).filter((d) => d !== "");
  }
  if (estado !== undefined) coartada.estado = estado;

  await coartada.save();
  return coartada;
}

async function eliminarCoartada(id, usuarioActual) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  if (
    coartada.autor.toString() !== usuarioActual._id.toString() &&
    usuarioActual.role !== "admin"
  ) {
    throw { status: 403, message: "No tienes permisos para eliminar esta coartada" };
  }

  await coartada.deleteOne();
}

// Alibi Chain (testigos) 

async function unirseComoTestigo(id, usuarioActual) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  if (coartada.autor.toString() === usuarioActual._id.toString()) {
    throw { status: 400, message: "El autor no puede ser testigo de su propia coartada" };
  }

  const yaEsTestigo = coartada.testigos.some(
    (t) => t.toString() === usuarioActual._id.toString(),
  );
  if (yaEsTestigo) {
    throw { status: 400, message: "Ya eres testigo de esta coartada" };
  }

  coartada.testigos.push(usuarioActual._id);
  await coartada.save();
  return coartada;
}

async function desertarDeLaCadena(id, usuarioActual) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  const esTestigo = coartada.testigos.some(
    (t) => t.toString() === usuarioActual._id.toString(),
  );
  if (!esTestigo) {
    throw { status: 400, message: "No eres testigo de esta coartada" };
  }

  coartada.testigos = coartada.testigos.filter(
    (t) => t.toString() !== usuarioActual._id.toString(),
  );

  // Misma penalización que desertarDeLaCadena() del frontend:
  // el autor y los testigos que quedaron pierden 5 puntos cada uno.
  await usuarioService.modificarCredibilidad(coartada.autor, -PENALIZACION_POR_DESERCION);
  for (const testigoId of coartada.testigos) {
    await usuarioService.modificarCredibilidad(testigoId, -PENALIZACION_POR_DESERCION);
  }

  await coartada.save();
  return coartada;
}

// Votos 

async function votar(id, votoData, usuarioActual) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  const { credibilidad, creatividad, consistencia } = votoData;

  const indiceExistente = coartada.votos.findIndex(
    (v) => v.usuario.toString() === usuarioActual._id.toString(),
  );

  const nuevoVoto = { usuario: usuarioActual._id, credibilidad, creatividad, consistencia };

  if (indiceExistente >= 0) {
    coartada.votos[indiceExistente] = nuevoVoto;
  } else {
    coartada.votos.push(nuevoVoto);
  }

  await coartada.save();
  return coartada;
}

// Marcar como falsa 

async function marcarComoFalsa(id, usuarioActual) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  const yaMarco = coartada.marcasFalsas.some(
    (m) => m.toString() === usuarioActual._id.toString(),
  );
  if (yaMarco) {
    throw { status: 400, message: "Ya marcaste esta coartada como falsa" };
  }

  coartada.marcasFalsas.push(usuarioActual._id);

  if (
    coartada.marcasFalsas.length >= VOTOS_NECESARIOS_PARA_EXPONER &&
    !coartada.expuesta
  ) {
    coartada.expuesta = true;
    coartada.estado = "Rejected";
    await usuarioService.modificarCredibilidad(coartada.autor, -PENALIZACION_POR_EXPOSICION);
  }

  await coartada.save();
  return coartada;
}

module.exports = {
  listarCoartadas,
  obtenerCoartadaPorId,
  crearCoartada,
  actualizarCoartada,
  eliminarCoartada,
  unirseComoTestigo,
  desertarDeLaCadena,
  votar,
  marcarComoFalsa,
  calcularIndiceCredibilidad,
};