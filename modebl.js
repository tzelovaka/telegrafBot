const sequelize = require('./db')
const storylin = require('./modelink')
const {DataTypes} = require('sequelize');

const storybl = sequelize.define ('storybl', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    linid: {type: DataTypes.INTEGER, primaryKey: true, /*unique: true,*/ allownull: false},
    bl: {type: DataTypes.STRING, allowNull: false},
})
storybl.hasMany(storylin);

module.exports = storybl;