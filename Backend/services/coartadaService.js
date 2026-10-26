const Coartada = require("../models/Coartada");
const Usuario = require("../models/Usuario");
const usuarioService = require("./usuarioService");
const {
  calcularComplejidad,
  calcularPromedioVotos,
  calcularIndiceCredibilidad,
} = require("../utils/credibilidad");
const { transicionValida, rolesPermitidos, transicionesDisponibles } = require("../utils/estados");

const PENALIZACION_POR_DESERCION = 5;
const PENALIZACION_POR_EXPOSICION = 10;
const VOTOS_NECESARIOS_PARA_EXPONER = 3;

//Helpers

function poblar(query) {
  return query
    .populate("autor", "alias especialidad")
    .populate("testigos", "alias")
    .populate("votos.usuario", "alias")
    .populate("marcasFalsas", "alias");
}

function idDe(valor) {
  return (valor && valor._id ? valor._id : valor).toString();
}

// Agrega índice recalculado, promedio y las transiciones que puede hacer el usuario
function presentar(coartada, usuarioActual) {
  const obj = coartada.toObject ? coartada.toObject() : coartada;
  const esAutor = usuarioActual ? idDe(obj.autor) === idDe(usuarioActual._id) : false;
  const esAdmin = usuarioActual ? usuarioActual.role === "admin" : false;

  return {
    ...obj,
    indice: calcularIndiceCredibilidad(coartada),
    promedioVotos: Math.round(calcularPromedioVotos(coartada) * 100) / 100,
    complejidad: calcularComplejidad(coartada),
    transiciones: transicionesDisponibles(obj.estado, esAutor, esAdmin),
  };
}

// Un borrador solo lo ve su autor (o un admin)
function esVisiblePara(coartada, usuarioActual) {
  if (coartada.estado !== "Draft") return true;
  if (usuarioActual.role === "admin") return true;
  return idDe(coartada.autor) === idDe(usuarioActual._id);
}

async function cargarCoartada(id) {
  const coartada = await Coartada.findById(id);
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };
  return coartada;
}

// Convierte una lista de alias o ids en ids de usuarios existentes
async function resolverTestigos(lista, autorId) {
  if (!Array.isArray(lista) || lista.length === 0) return [];

  const idsUnicos = new Set();
  for (const item of lista) {
    if (!item) continue;
    const texto = String(item).trim();
    let usuario = null;
    if (/^[a-f\d]{24}$/i.test(texto)) usuario = await Usuario.findById(texto);
    if (!usuario) usuario = await Usuario.findOne({ alias: texto });
    if (!usuario) throw { status: 400, message: `El testigo "${texto}" no existe` };
    if (usuario._id.toString() === autorId.toString()) {
      throw { status: 400, message: "El autor no puede ser testigo de su propia coartada" };
    }
    idsUnicos.add(usuario._id.toString());
  }
  return [...idsUnicos];
}

// CRUD

async function listarCoartadas(usuarioActual) {
  const coartadas = await poblar(Coartada.find().sort({ createdAt: -1 }));
  return coartadas
    .filter((c) => esVisiblePara(c, usuarioActual))
    .map((c) => presentar(c, usuarioActual));
}

async function obtenerCoartadaPorId(id, usuarioActual) {
  const coartada = await poblar(Coartada.findById(id));
  if (!coartada) throw { status: 404, message: "Coartada no encontrada" };

  if (usuarioActual && !esVisiblePara(coartada, usuarioActual)) {
    throw { status: 404, message: "Coartada no encontrada" };
  }
  return presentar(coartada, usuarioActual);
}

async function crearCoartada(data, usuarioActual) {
  const puedeCrear = usuarioService.puedeCrearCoartada(usuarioActual);
  if (!puedeCrear) {
    throw {
      status: 403,
      message: "Estás bloqueado: no puedes crear coartadas todavía.",
    };
  }

  const { titulo, situacion, historia, detalles, estado, testigos } = data;

  const detallesLlenos = (detalles || [])
    .map((d) => String(d).trim())
    .filter((d) => d !== "");

  const testigosIds = await resolverTestigos(testigos, usuarioActual._id);

  const nuevaCoartada = new Coartada({
    titulo,
    situacion,
    historia,
    detalles: detallesLlenos,
    testigos: testigosIds,
    // Solo Draft o Submitted al crear; el resto va por la máquina de estados
    estado: estado === "Submitted" ? "Submitted" : "Draft",
    autor: usuarioActual._id,
  });

  await nuevaCoartada.save();
  return await obtenerCoartadaPorId(nuevaCoartada._id, usuarioActual);
}

async function actualizarCoartada(id, data, usuarioActual) {
  const coartada = await cargarCoartada(id);
  const esAdmin = usuarioActual.role === "admin";
  const esAutor = coartada.autor.toString() === usuarioActual._id.toString();

  if (!esAutor && !esAdmin) {
    throw { status: 403, message: "No tienes permisos para actualizar esta coartada" };
  }

  const { titulo, situacion, historia, detalles, estado } = data;
  const editaContenido =
    titulo !== undefined ||
    situacion !== undefined ||
    historia !== undefined ||
    detalles !== undefined;

  if (editaContenido && coartada.estado !== "Draft") {
    throw { status: 400, message: "Solo se puede editar el contenido de un borrador" };
  }

  if (titulo !== undefined) coartada.titulo = titulo;
  if (situacion !== undefined) coartada.situacion = situacion;
  if (historia !== undefined) coartada.historia = historia;
  if (detalles !== undefined) {
    coartada.detalles = detalles.map((d) => String(d).trim()).filter((d) => d !== "");
  }

  if (estado !== undefined && estado !== coartada.estado) {
    aplicarTransicion(coartada, estado, esAutor, esAdmin);
  }

  await coartada.save();
  return await obtenerCoartadaPorId(coartada._id, usuarioActual);
}

function aplicarTransicion(coartada, nuevoEstado, esAutor, esAdmin) {
  if (!transicionValida(coartada.estado, nuevoEstado)) {
    throw {
      status: 400,
      message: `Transición inválida: ${coartada.estado} → ${nuevoEstado}`,
    };
  }
  const roles = rolesPermitidos(coartada.estado, nuevoEstado);
  const autorizado = (esAutor && roles.includes("autor")) || (esAdmin && roles.includes("admin"));
  if (!autorizado) {
    throw {
      status: 403,
      message: `No tienes permisos para pasar la coartada de ${coartada.estado} a ${nuevoEstado}`,
    };
  }
  coartada.estado = nuevoEstado;
}

async function cambiarEstado(id, nuevoEstado, usuarioActual) {
  return await actualizarCoartada(id, { estado: nuevoEstado }, usuarioActual);
}

async function eliminarCoartada(id, usuarioActual) {
  const coartada = await cargarCoartada(id);

  if (
    coartada.autor.toString() !== usuarioActual._id.toString() &&
    usuarioActual.role !== "admin"
  ) {
    throw { status: 403, message: "No tienes permisos para eliminar esta coartada" };
  }

  await coartada.deleteOne();
}

// Alibi Chain 

async function unirseComoTestigo(id, usuarioActual) {
  const coartada = await cargarCoartada(id);

  if (coartada.estado === "Draft" || coartada.estado === "Rejected") {
    throw {
      status: 400,
      message: "Solo puedes unirte a coartadas enviadas que no hayan sido rechazadas",
    };
  }

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
  return await obtenerCoartadaPorId(coartada._id, usuarioActual);
}

async function desertarDeLaCadena(id, usuarioActual) {
  const coartada = await cargarCoartada(id);

  const esTestigo = coartada.testigos.some(
    (t) => t.toString() === usuarioActual._id.toString(),
  );
  if (!esTestigo) {
    throw { status: 400, message: "No eres testigo de esta coartada" };
  }

  coartada.testigos = coartada.testigos.filter(
    (t) => t.toString() !== usuarioActual._id.toString(),
  );

  // El autor y los testigos que quedaron pierden 5 puntos cada uno
  await coartada.save();
  await usuarioService.modificarCredibilidad(coartada.autor, -PENALIZACION_POR_DESERCION);
  for (const testigoId of coartada.testigos) {
    await usuarioService.modificarCredibilidad(testigoId, -PENALIZACION_POR_DESERCION);
  }

  return await obtenerCoartadaPorId(coartada._id, usuarioActual);
}

//Votos 

async function votar(id, votoData, usuarioActual) {
  const coartada = await cargarCoartada(id);

  if (coartada.estado === "Draft") {
    throw { status: 400, message: "No se puede votar un borrador" };
  }

  if (coartada.autor.toString() === usuarioActual._id.toString()) {
    throw { status: 400, message: "No puedes votar tu propia coartada" };
  }

  const { credibilidad, creatividad, consistencia } = votoData;

  // Unicidad (usuario, coartada)
  const yaVoto = coartada.votos.some(
    (v) => v.usuario.toString() === usuarioActual._id.toString(),
  );
  if (yaVoto) {
    throw { status: 400, message: "Ya votaste esta coartada" };
  }

  coartada.votos.push({
    usuario: usuarioActual._id,
    credibilidad,
    creatividad,
    consistencia,
  });

  // El índice se recalcula al guardar (hook del modelo)
  await coartada.save();
  return await obtenerCoartadaPorId(coartada._id, usuarioActual);
}

//Marcar como falsa

async function marcarComoFalsa(id, usuarioActual) {
  const coartada = await cargarCoartada(id);

  if (coartada.estado === "Draft") {
    throw { status: 400, message: "No se puede marcar un borrador como falso" };
  }

  if (coartada.autor.toString() === usuarioActual._id.toString()) {
    throw { status: 400, message: "No puedes marcar como falsa tu propia coartada" };
  }

  const yaMarco = coartada.marcasFalsas.some(
    (m) => m.toString() === usuarioActual._id.toString(),
  );
  if (yaMarco) {
    throw { status: 400, message: "Ya marcaste esta coartada como falsa" };
  }

  coartada.marcasFalsas.push(usuarioActual._id);

  let recienExpuesta = false;
  if (
    coartada.marcasFalsas.length >= VOTOS_NECESARIOS_PARA_EXPONER &&
    !coartada.expuesta
  ) {
    coartada.expuesta = true;
    coartada.estado = "Rejected";
    recienExpuesta = true;
  }

  await coartada.save();

  if (recienExpuesta) {
    await usuarioService.modificarCredibilidad(coartada.autor, -PENALIZACION_POR_EXPOSICION);
  }

  return await obtenerCoartadaPorId(coartada._id, usuarioActual);
}

module.exports = {
  listarCoartadas,
  obtenerCoartadaPorId,
  crearCoartada,
  actualizarCoartada,
  cambiarEstado,
  eliminarCoartada,
  unirseComoTestigo,
  desertarDeLaCadena,
  votar,
  marcarComoFalsa,
  calcularIndiceCredibilidad,
  presentar,
};