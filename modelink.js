const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const storylin = sequelize.define ('storylin', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    link: {type: DataTypes.STRING},
    smile: {type: DataTypes.STRING(1), allowNull: true, defaultValue: '👆'},
    authId: {type: DataTypes.BIGINT},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})

module.exports = storylin;