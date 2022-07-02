const {Sequelize} = require('sequelize')
module.exports = new Sequelize(
    'testdb',
    'postgres',
    '5233243',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)
