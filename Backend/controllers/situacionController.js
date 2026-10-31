const situacionService = require("../services/situacionService");
const asyncHandler = require("../utils/asyncHandler");

const listar = asyncHandler(async (req, res) => {
    const situaciones = await situacionService.listarSituaciones();
    res.status(200).json({ok: true, count: situaciones.length, situaciones});
});

const obtener = asyncHandler(async (req, res) => {
    const situacion = await situacionService.obtenerSituacion(req.params.id, req.usuario);
    res.status(200).json({ok: true, situacion});
});

const crear = asyncHandler(async (req, res) => {
    const situacion = await situacionService.crearSituacion(req.body, req.usuario);
    res.status(201).json({ok: true, mensaje: "Situación creada con éxito", situacion});
});

const solicitar = asyncHandler(async (req, res) => {
    const situacion = await situacionService.solicitarCoartada(req.params.id, req.body.mensaje, req.usuario);
    res.status(200).json({ok: true, mensaje: "Solicitud registrada", situacion});
});

const actualizar = asyncHandler(async (req, res) => {
    const situacion = await situacionService.actualizarSituacion(req.params.id, req.body);
    res.status(200).json({ok: true, mensaje: "Situación actualizada", situacion});
});

const eliminar = asyncHandler(async (req, res) => {
    await situacionService.eliminarSituacion(req.params.id);
    res.status(200).json({ok: true, mensaje: "Situación eliminada"});
});

module.exports = {listar, obtener, crear, solicitar, actualizar, eliminar};