const express = require('express');
const situacionController = require('../controllers/situacionController');
const {autentircar} = require('../middleware/auth');
const {validarSituacion} = require('../middleware/validators');

const router = express.Router();
router.use(autentircar);

router.get('/', situacionController.listar);
router.post('/', validarSituacion, situacionController.crear);
router.get('/:id', situacionController.obtener);
router.post('/:id/solicitar', situacionController.solicitar);

module.exports = router;