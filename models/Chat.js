const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Chat extends Model { };

Chat.init({
    from: {
        type: DataTypes.STRING
    }, key: {
        type: DataTypes.STRING
    },
    mention: {
        type: DataTypes.STRING
    },
    pushName: {
        type: DataTypes.STRING
    },
    body: {
        type: DataTypes.STRING
    },
    messageTimestamp: {
        type: DataTypes.TIME,
    },
    text: {
        type: DataTypes.STRING,
    },
    mid: {
        type: DataTypes.STRING,
    },
    remoteJid: {
        type: DataTypes.STRING,

    }
}, {
    sequelize,
    modelName: 'chat',
    timestamps: true

})

module.exports = Chat;