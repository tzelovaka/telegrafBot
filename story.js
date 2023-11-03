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
sequelize.sync()
  .then(() => {
    return story.addColumn('spam', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
  })
  .then(() => {
    story.addColumn('verification', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
  }).then(()=>{
    console.log('2 columns was added succesfully');
  })
  .catch((err) => {
    console.error('Error adding column:', err);
  });

module.exports = story;