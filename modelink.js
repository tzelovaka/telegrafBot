const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storylin = sequelize.define ('storylin', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    link: {type: DataTypes.STRING, allowNull: false},
    authId: {type: DataTypes.INTEGER, allowNull: false},
    release: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false}
})

module.exports = storylin;