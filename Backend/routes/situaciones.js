const express = require('express');
const situacionController = require('../controllers/situacionController');
const {autenticar} = require('../middleware/auth');
const {validarSituacion} = require('../middleware/validators');

const router = express.Router();
router.use(autenticar);

router.get('/', situacionController.listar);
router.post('/', validarSituacion, situacionController.crear);
router.get('/:id', situacionController.obtener);
router.post('/:id/solicitar', situacionController.solicitar);

module.exports = router;