const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const car = sequelize.define ('car', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    mark: {type: DataTypes.STRING, allowNull: true},
    model: {type: DataTypes.STRING, allowNull: true},
    pic: {type: DataTypes.STRING, allowNull: true},
})
module.exports = car;