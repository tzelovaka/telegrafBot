const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const story = sequelize.define ('story', {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    views: {type: DataTypes.BIGINT, unique: false, defaultValue: 0},
    img: {type: DataTypes.TEXT, allowNull: true, defaultValue: null},
    title: {type: DataTypes.STRING},
    desc: {type: DataTypes.STRING},
    authId: {type: DataTypes.BIGINT, unique: false},
    release: {type: DataTypes.BOOLEAN, defaultValue: false}
})
sequelize.addColumn('story', 'spam', {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    primaryKey: false,
    unique: false,
  })
    .then(() => story.reload({}))
    .catch(err => console.error(err))
module.exports = story;