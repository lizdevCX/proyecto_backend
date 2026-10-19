const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/user.model')
const RolePermission = require('../models/rolePermission.model');


dotenv.config(); //se activa las lecturas de las variables del .env

const SECRET_KEY = process.env.JWT_SECRET;

//async se encarga de cargar las consultas con la base de datos
exports.loginUser = async (email, password) => {
    try {
        //Verificar si el usuario existe
        //findOne metodo propio de sequalize
        const user = await User.findOne({where: {email}});
        if(!user) {
            throw new Error('Usuario no encontrado');
        }

        //Verificar si la contrasena es correcta
        //bcrypt hace la comparacion con la contrasena con el hash
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error('Contrasena incorrecta');
        }

        //Consultar los permisos del rol
        //Busca todos los permisos que le corresponden al usuario que inicio sesion
        const rolePermissions = await RolePermission.findAll({
            where: { rol_id: user.rol_id },
            attributes: ['permiso_id'] //pide a sequalize que solo traiga las filas del permiso
        });

        const permisos = rolePermissions.map(rp => rp.permiso_id);

        //Generar un token JWT
        const token = jwt.sign(
            {id: user.id, nombre: user.nombre, email: user.email, rol_id: user.rol_id, permisos},
            SECRET_KEY,
            { expiresIn: '1h'} //reinicia la sesion
        );

        return token;
    } catch (error){
        throw new Error(error.message || 'Error al iniciar sesion');
    }
};