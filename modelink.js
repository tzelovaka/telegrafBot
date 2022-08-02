const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storylin = sequelize.define ('storylin', {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    link: {type: DataTypes.STRING},
    authId: {type: DataTypes.BIGINT, unique: true},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})

module.exports = storylin;