const sequelize = require('./db')
const storylin = require('./modelink')
const {DataTypes} = require('sequelize');

const storybl = sequelize.define ('storybl', {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    linid: {type: DataTypes.INTEGER},
    bl: {type: DataTypes.STRING},
    authId: {type: DataTypes.BIGINT, unique: true},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})
storybl.hasMany(storylin);

module.exports = storybl;