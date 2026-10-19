const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];//request a la respuesta http authorization y accede al token

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado, no se proporcionó un token' });//retorna una respuesta 401 no se envio el token
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });//No se tiene autorizacion valida para acceder, el acceso es prohibido
        }
        req.user = user;//se guarda informacion dentro del token, del usuario nos da el rol id y administrador id del usuario
        next();//la validacion fue exitosa y se puede continuar para finalizar la peticion
    });
};
//Autorizacion, que esta autorizado el usuario para hacer en el sistema, permisos segun rol
const checkRole = (roles) => {
    return (req, res, next) => {
        const { rol_id } = req.user;

        if (!roles.includes(rol_id)) {
            return res.status(403).json({ message: 'Acceso denegado, no tienes permiso para realizar esta acción' });
        }

        next();
    };
};

module.exports = { authenticateToken, checkRole };