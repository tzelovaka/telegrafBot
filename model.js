const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const car = sequelize.define ('car', {
    mark: {type: DataTypes.STRING, allowNull: false},
    model: {type: DataTypes.STRING, allowNull: false}
})
module.exports = car;