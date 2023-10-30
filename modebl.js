const sequelize = require('./db')
const storylin = require('./modelink')
const {DataTypes} = require('sequelize');

const storybl = sequelize.define ('storybl', {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    fId: {type: DataTypes.BIGINT},
    img: {type: DataTypes.TEXT, allowNull: true, defaultValue: null},
    text: {type: DataTypes.TEXT},
    positionX: {type: DataTypes.BIGINT},
    positionY: {type: DataTypes.BIGINT},
    storyId: {type: DataTypes.BIGINT, unique: false},
    authId: {type: DataTypes.BIGINT, unique: false},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})
storybl.hasMany(storylin);

module.exports = storybl;