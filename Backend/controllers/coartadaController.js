const coartadaService = require("../services/coartadaService");
const asyncHandler = require("../utils/asyncHandler");

const obtenerCoartadas = asyncHandler(async (req, res) => {
  const coartadas = await coartadaService.listarCoartadas();
  res.status(200).json({ ok: true, count: coartadas.length, coartadas });
});

const obtenerCoartadaPorId = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.obtenerCoartadaPorId(req.params.id);
  res.status(200).json({ ok: true, coartada });
});

const crearCoartada = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.crearCoartada(req.body, req.usuario);
  res.status(201).json({ ok: true, mensaje: "Coartada creada exitosamente", coartada });
});

const actualizarCoartada = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.actualizarCoartada(req.params.id, req.body, req.usuario);
  res.status(200).json({ ok: true, mensaje: "Coartada actualizada", coartada });
});

const eliminarCoartada = asyncHandler(async (req, res) => {
  await coartadaService.eliminarCoartada(req.params.id, req.usuario);
  res.status(200).json({ ok: true, mensaje: "Coartada eliminada correctamente" });
});

const unirseComoTestigo = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.unirseComoTestigo(req.params.id, req.usuario);
  res.status(200).json({ ok: true, mensaje: "Ahora eres testigo de la coartada", coartada });
});

const desertarDeLaCadena = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.desertarDeLaCadena(req.params.id, req.usuario);
  res.status(200).json({ ok: true, mensaje: "Abandonaste la Alibi Chain", coartada });
});

const votar = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.votar(req.params.id, req.body, req.usuario);
  res.status(200).json({ ok: true, mensaje: "Voto registrado", coartada });
});

const marcarComoFalsa = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.marcarComoFalsa(req.params.id, req.usuario);
  res.status(200).json({ ok: true, mensaje: "Coartada marcada como falsa", coartada });
});

const obtenerIndice = asyncHandler(async (req, res) => {
  const coartada = await coartadaService.obtenerCoartadaPorId(req.params.id);
  const indice = coartadaService.calcularIndiceCredibilidad(coartada);
  res.status(200).json({ ok: true, indice });
});

module.exports = {
  obtenerCoartadas,
  obtenerCoartadaPorId,
  crearCoartada,
  actualizarCoartada,
  eliminarCoartada,
  unirseComoTestigo,
  desertarDeLaCadena,
  votar,
  marcarComoFalsa,
  obtenerIndice,
};