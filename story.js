const sequelize = require('./db')
const {DataTypes, HasMany} = require('sequelize')

const story = sequelize.define ('story', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    desc: {type: DataTypes.STRING, allowNull: false},
    authId: {type: DataTypes.INTEGER, allowNull: false}
})

module.exports = story;