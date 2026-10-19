const express = require('express');//express nos sirve para manejar las rutas
const router = express.Router();
const authController = require('../controllers/auth.controller');//cuando llegue una peticion del login se le entrega a ese controller

router.post('/auth/login', authController.login);//router post metodo http para enviar informacion
//la ruta delega la responsabilidad de autenticacion del login al controller
module.exports = router;