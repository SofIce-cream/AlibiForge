const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const usuarioService = require("../services/usuarioService");
const { autenticar, autorizar } = require("../middleware/auth");
const { verificarValidaciones } = require("../middleware/validators");

const router = express.Router();

router.use(autenticar);

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Perfil propio y gestión de usuarios (algunas rutas solo admin)
 */

/**
 * @swagger
 * /api/usuarios/me:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado (alias, especialidad, credibilidad, bloqueo)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *       401:
 *         description: No autenticado
 */
router.get("/me", (req, res) => {
  res.json(req.usuario);
});

// El resto de rutas de este archivo son solo para administradores
router.use(autorizar("admin"));

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos los usuarios (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: No tienes permisos (requiere rol admin)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const usuarios = await usuarioService.listarUsuarios();
    res.json(usuarios);
  })
);

/**
 * @swagger
 * /api/usuarios/{id}/rol:
 *   put:
 *     summary: Cambia el rol de un usuario (solo admin)
 *     tags: [Usuarios]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  "/:id/rol",
  body("role").isIn(["admin", "user"]).withMessage("El rol debe ser 'admin' o 'user'"),
  verificarValidaciones,
  asyncHandler(async (req, res) => {
    const usuario = await usuarioService.cambiarRol(req.params.id, req.body.role);
    res.json({ mensaje: "Rol actualizado correctamente", usuario });
  })
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario (solo admin)
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await usuarioService.eliminarUsuario(req.params.id);
    res.status(200).json({ mensaje: "Usuario eliminado exitosamente" });
  })
);

module.exports = router;