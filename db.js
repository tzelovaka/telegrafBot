const {Sequelize} = require('sequelize')
const cls = require('cls-hooked');
const namespace = cls.createNamespace('my-very-own-namespace');
Sequelize.useCLS(namespace);

module.exports = sequelize = new Sequelize(process.env.HEROKU_POSTGRESQL_OLIVE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});