const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const message = sequelize.define ('message', {
    authId: {type: DataTypes.BIGINT, unique: true},
    message_id: {type: DataTypes.BIGINT, unique: true},
})

module.exports = user;