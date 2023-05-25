const mongoose = require("mongoose");

const messagesInfoSchema = new mongoose.Schema({

    conversationId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    messageType:{
        type:String,
        required:true
    }
})

const messagesInfo = mongoose.model("messagesInfo", messagesInfoSchema);

module.exports = messagesInfo;