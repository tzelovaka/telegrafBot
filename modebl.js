const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storybl = sequelize.define ('storybl', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    bl: {type: DataTypes.STRING, allowNull: true},
})

module.exports = storybl;