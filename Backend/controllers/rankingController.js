const rankingService = require("../services/rankingService");
const asyncHandler = require("../utils/asyncHandler");

const obtenerRankings = asyncHandler(async (req, res) => {
  const rankings = await rankingService.calcularRankings();
  res.status(200).json({ ok: true, rankings });
});

module.exports = { obtenerRankings };
