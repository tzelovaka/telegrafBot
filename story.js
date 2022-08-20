const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const story = sequelize.define ('story', {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    pic: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    desc: {type: DataTypes.STRING},
    authId: {type: DataTypes.BIGINT},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})

module.exports = story;