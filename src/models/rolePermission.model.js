const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');

const RolePermission = sequelize.define('roles_permisos', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    permiso_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'roles_permisos'
});

exports.RolePermission = RolePermission;