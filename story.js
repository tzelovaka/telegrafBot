const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const story = sequelize.define ("story", {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    views: {type: DataTypes.BIGINT, unique: false, defaultValue: 0},
    img: {type: DataTypes.TEXT, allowNull: true, defaultValue: null},
    title: {type: DataTypes.STRING},
    desc: {type: DataTypes.STRING},
    authId: {type: DataTypes.BIGINT, unique: false},
    release: {type: DataTypes.BOOLEAN, defaultValue: false},
    spam: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    verification: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
}, {
    tableName: "stories",
})
module.exports = story;