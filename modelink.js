const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storylin = sequelize.define ('storylin', {
    //id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    link: {type: DataTypes.STRING},
    authId: {type: DataTypes.INTEGER (255), unique: true},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})

module.exports = storylin;