const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');
const ROLES = require('../utils/constants');
const errorHandler = require('../middleware/error.middleware');

// Ruta de usuarios
//Crea el usuario, revisa el JWT si no existe arroja error 401, hace la validacion del rol, si todas las validaciones son correctas se crea el usuario 
router.post('/users/create', authenticateToken, checkRole([ROLES.ADMIN]), userController.createUser);
//Actualizar el usuario con id del usuario no de rol
router.put('/users/update/:id', authenticateToken, checkRole([ROLES.ADMIN]), userController.updateUser);
//Obtener, consultar
router.get('/users', authenticateToken, checkRole([ROLES.ADMIN]), userController.getAllUsersByAdministradorId);
//Eliminar segun el id del usuario
router.delete('/users/delete/:id', authenticateToken, checkRole([ROLES.ADMIN]), userController.deleteUser);
//consultar usuarios con id del rol
router.get('/users/rol/:id', authenticateToken, checkRole([ROLES.ADMIN]), userController.getAllUsersByRolId);

// Middleware para manejar errores
router.use(errorHandler);

module.exports = router;