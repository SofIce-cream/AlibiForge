const express = require("express");
const coartadaController = require("../controllers/coartadaController");
const { autenticar } = require("../middleware/auth");
const { validarCoartada, validarVoto } = require("../middleware/validators");

const router = express.Router();
router.use(autenticar);

/**
 * @swagger
 * tags:
 *   name: Coartadas
 *   description: Creación, consulta y gestión de coartadas (requiere autenticación)
 */

/**
 * @swagger
 * /api/coartadas:
 *   get:
 *     summary: Lista todas las coartadas
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de coartadas
 *       401:
 *         description: No autenticado
 */
router.get("/", coartadaController.obtenerCoartadas);

/**
 * @swagger
 * /api/coartadas/{id}:
 *   get:
 *     summary: Obtiene una coartada por ID
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coartada encontrada
 *       404:
 *         description: Coartada no encontrada
 */
router.get("/:id", coartadaController.obtenerCoartadaPorId);

/**
 * @swagger
 * /api/coartadas:
 *   post:
 *     summary: Crea una nueva coartada (requiere al menos 3 detalles)
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, situacion, historia, detalles]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: La excusa del parcial
 *               situacion:
 *                 type: string
 *                 example: Llegue tarde a un parcial
 *               historia:
 *                 type: string
 *                 maxLength: 500
 *                 example: Se me pinchó una llanta de camino a la universidad...
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Llamé a una grúa", "Tengo foto de la llanta", "Llegué 40 min tarde"]
 *               estado:
 *                 type: string
 *                 enum: [Draft, Submitted]
 *                 example: Draft
 *     responses:
 *       201:
 *         description: Coartada creada
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: El usuario está bloqueado y no puede crear coartadas
 */
router.post("/", validarCoartada, coartadaController.crearCoartada);

/**
 * @swagger
 * /api/coartadas/{id}:
 *   put:
 *     summary: Actualiza una coartada existente
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               situacion:
 *                 type: string
 *               historia:
 *                 type: string
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: string
 *               estado:
 *                 type: string
 *                 enum: [Draft, Submitted, UnderReview, Rejected, Approved]
 *     responses:
 *       200:
 *         description: Coartada actualizada
 *       403:
 *         description: No tienes permisos para actualizar esta coartada
 *       404:
 *         description: Coartada no encontrada
 */
router.put("/:id", coartadaController.actualizarCoartada);

/**
 * @swagger
 * /api/coartadas/{id}:
 *   delete:
 *     summary: Elimina una coartada
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coartada eliminada exitosamente
 *       403:
 *         description: No tienes permisos para eliminar esta coartada
 *       404:
 *         description: Coartada no encontrada
 */
router.delete("/:id", coartadaController.eliminarCoartada);

/**
 * @swagger
 * /api/coartadas/{id}/testigo:
 *   post:
 *     summary: Se une como testigo a la Alibi Chain de una coartada
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ahora eres testigo de la coartada
 *       400:
 *         description: Ya eres testigo, o eres el autor de la coartada
 *       404:
 *         description: Coartada no encontrada
 */
router.post("/:id/testigo", coartadaController.unirseComoTestigo);

/**
 * @swagger
 * /api/coartadas/{id}/testigo:
 *   delete:
 *     summary: Abandona la Alibi Chain como testigo (penaliza credibilidad)
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Abandonaste la Alibi Chain
 *       400:
 *         description: No eres testigo de esta coartada
 *       404:
 *         description: Coartada no encontrada
 */
router.delete("/:id/testigo", coartadaController.desertarDeLaCadena);

/**
 * @swagger
 * /api/coartadas/{id}/votar:
 *   post:
 *     summary: Vota una coartada en credibilidad, creatividad y consistencia (1-5)
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credibilidad, creatividad, consistencia]
 *             properties:
 *               credibilidad:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               creatividad:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               consistencia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Voto registrado (si ya habías votado, se actualiza)
 *       400:
 *         description: Datos de voto inválidos
 *       404:
 *         description: Coartada no encontrada
 */
router.post("/:id/votar", validarVoto, coartadaController.votar);

/**
 * @swagger
 * /api/coartadas/{id}/marcar-falsa:
 *   post:
 *     summary: Marca una coartada como falsa (al llegar a 3 marcas se expone y rechaza)
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coartada marcada como falsa
 *       400:
 *         description: Ya marcaste esta coartada como falsa
 *       404:
 *         description: Coartada no encontrada
 */
router.post("/:id/marcar-falsa", coartadaController.marcarComoFalsa);

/**
 * @swagger
 * /api/coartadas/{id}/indice:
 *   get:
 *     summary: Calcula el índice de credibilidad actual de una coartada
 *     tags: [Coartadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Índice de credibilidad calculado
 *       404:
 *         description: Coartada no encontrada
 */
router.get("/:id/indice", coartadaController.obtenerIndice);

module.exports = router;