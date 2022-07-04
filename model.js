const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const bmw = sequelize.define ('bmw', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    model: {type: DataTypes.STRING, allowNull: false},
    pic: {type: DataTypes.STRING, allowNull: false},
})
module.exports = bmw;