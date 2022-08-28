const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storyrate = sequelize.define ('storyrate', {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    rating: {type: DataTypes.BIGINT(1), allowNull: true, defaultValue: null},
    view: {type: DataTypes.STRING},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})

module.exports = storyrate;