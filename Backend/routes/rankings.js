const express = require("express");
const rankingController = require("../controllers/rankingController");
const { autenticar } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rankings
 *   description: Tablas de posiciones (Master of Deceit, Most Creative, etc)
 */

/**
 * @swagger
 * /api/rankings:
 *   get:
 *     summary: Obtiene los 4 rankings (masterDeceit, mostCreative, mostConsistent, mostWanted)
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rankings calculados
 *       401:
 *         description: No autenticado
 */
router.get("/", autenticar, rankingController.obtenerRankings);

module.exports = router;