const {Sequelize} = require('sequelize')
module.exports = new Sequelize(
    'da3dj75k47iina',
    'uumihhewuscsaz',
    'bc8deae462f543e0c6692197da02cfc5e68bc0e1f774b7cacd8c9bca473825e8',
    {
        host: '72.44.34.25',
        port: '5432',
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: true,
            rejectUnauthorized: false
        }
    }
)