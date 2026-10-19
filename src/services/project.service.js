const Project = require('../models/project.model');
const User = require('../models/user.model');
const UserProject = require('../models/userProject.model');
const ROLES = require('../utils/constants');

// Crea un proyecto. Quien lo crea queda como su administrador responsable.
exports.createProject = async (nombre, descripcion, administrador_id) => {
    try {
        const newProject = await Project.create({
            nombre,
            descripcion,
            administrador_id
        });

        return newProject;
    } catch (err) {
        throw new Error(`Error al crear el proyecto: ${err.message}`);
    }
};

// Lista todos los proyectos. Pensado para un administrador que ve todo el sistema.
exports.getAllProjects = async () => {
    try {
        const projects = await Project.findAll();
        return projects;
    } catch (err) {
        throw new Error(`Error al obtener los proyectos: ${err.message}`);
    }
};

// Lista los proyectos en los que participa un usuario (tabla usuarios_proyectos)
exports.getProjectsByUserId = async (userId) => {
    try {
        const participaciones = await UserProject.findAll({
            where: { usuario_id: userId }
        });

        const proyectoIds = participaciones.map(p => p.proyecto_id);

        const projects = await Project.findAll({
            where: { id: proyectoIds }
        });

        return projects;
    } catch (err) {
        throw new Error(`Error al obtener los proyectos del usuario: ${err.message}`);
    }
};

// Asigna un usuario a un proyecto. Solo el administrador del proyecto puede asignar participantes.
exports.assignUsersToProject = async (data) => {
    const { proyecto_id, usuario_id, admin_from_token } = data;
    try {
        const project = await Project.findByPk(proyecto_id);
        if (!project) {
            throw new Error('Proyecto no encontrado');
        }

        if (project.administrador_id !== admin_from_token) {
            throw new Error('Acceso denegado, este proyecto no esta bajo su administración');
        }

        const user = await User.findByPk(usuario_id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Regla de negocio: no duplicar participación (usuario_id + proyecto_id es único)
        const yaExiste = await UserProject.findOne({
            where: { usuario_id, proyecto_id }
        });
        if (yaExiste) {
            throw new Error('El usuario ya participa en este proyecto');
        }

        const participacion = await UserProject.create({ usuario_id, proyecto_id });
        return participacion;
    } catch (err) {
        throw new Error(`Error al asignar el usuario al proyecto: ${err.message}`);
    }
};

// Quita a un usuario de un proyecto. Solo el administrador del proyecto puede hacerlo.
exports.removeUserFromProject = async (data) => {
    const { proyecto_id, usuario_id, admin_from_token } = data;
    try {
        const project = await Project.findByPk(proyecto_id);
        if (!project) {
            throw new Error('Proyecto no encontrado');
        }

        if (project.administrador_id !== admin_from_token) {
            throw new Error('Acceso denegado, este proyecto no esta bajo su administración');
        }

        const participacion = await UserProject.findOne({
            where: { usuario_id, proyecto_id }
        });
        if (!participacion) {
            throw new Error('Este usuario no participa en el proyecto');
        }

        await participacion.destroy();
        return { message: 'Usuario removido del proyecto con éxito' };
    } catch (err) {
        throw new Error(`Error al remover el usuario del proyecto: ${err.message}`);
    }
};

// Actualiza un proyecto. Solo el administrador responsable puede modificarlo.
exports.updateProject = async (data) => {
    const { id, nombre, descripcion, admin_from_token } = data;
    try {
        const project = await Project.findByPk(id);
        if (!project) {
            throw new Error('Proyecto no encontrado');
        }

        if (project.administrador_id !== admin_from_token) {
            throw new Error('Acceso denegado, este proyecto no esta bajo su administración');
        }

        await project.update({ nombre, descripcion });
        return project;
    } catch (err) {
        throw new Error(`Error al actualizar el proyecto: ${err.message}`);
    }
};

// Elimina un proyecto. Solo el administrador responsable puede eliminarlo.
// Al borrar el proyecto, sus participaciones en usuarios_proyectos se eliminan en cascada (definido en la base de datos).
exports.deleteProject = async (id, admin_from_token) => {
    try {
        const project = await Project.findByPk(id);
        if (!project) {
            throw new Error('Proyecto no encontrado');
        }

        if (project.administrador_id !== admin_from_token) {
            throw new Error('Acceso denegado, este proyecto no esta bajo su administración');
        }

        await project.destroy();
        return { message: 'Proyecto eliminado con éxito' };
    } catch (err) {
        throw new Error(`Error al eliminar el proyecto: ${err.message}`);
    }
};

// Consulta un proyecto por id. Solo puede verlo su administrador o un usuario que participe en él.
exports.getProjectById = async (id, userId) => {
    try {
        const project = await Project.findByPk(id);
        if (!project) {
            throw new Error('Proyecto no encontrado');
        }

        const esAdministrador = project.administrador_id === userId;

        const participa = await UserProject.findOne({
            where: { usuario_id: userId, proyecto_id: id }
        });

        if (!esAdministrador && !participa) {
            throw new Error('Acceso denegado, no tiene relación con este proyecto');
        }

        return project;
    } catch (err) {
        throw new Error(`Error al obtener el proyecto: ${err.message}`);
    }
};