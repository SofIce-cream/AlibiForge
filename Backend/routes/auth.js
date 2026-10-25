const express = require("express");
const authControllers = require("../controllers/authControllers");
const { validarRegistro, validarLogin } = require("../middleware/validators");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registro e inicio de sesión
 */

/**
 * @swagger
 * /api/auth/registrar:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [alias, password]
 *             properties:
 *               alias:
 *                 type: string
 *                 example: ShadowHuntress
 *               password:
 *                 type: string
 *                 example: clave123
 *               especialidad:
 *                 type: string
 *                 enum: [Excusa Creativa, Detallista, Improvisador, Conspirador]
 *                 example: Excusa Creativa
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos o alias ya en uso
 */
router.post("/registrar", validarRegistro, authControllers.registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [alias, password]
 *             properties:
 *               alias:
 *                 type: string
 *                 example: ShadowHuntress
 *               password:
 *                 type: string
 *                 example: clave123
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el usuario y el token
 *       401:
 *         description: Alias o contraseña incorrectos
 */
router.post("/login", validarLogin, authControllers.login);

module.exports = router;
