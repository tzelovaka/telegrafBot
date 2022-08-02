const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const story = sequelize.define ('story', {
   // id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    desc: {type: DataTypes.STRING},
    authId: {type: DataTypes.STRING},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})

module.exports = story;