const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storylin = sequelize.define ('storylin', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    link: {type: DataTypes.STRING, allowNull: true},
})

module.exports = storylin;