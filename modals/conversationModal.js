const mongoose = require("mongoose");

const conversationInfoSchema = new mongoose.Schema({

    members: {
        type: Array,
        required: true
    },
    unreadMessages:{
        type:Number,
        default:0
    },
    updateTime:{
        type:Date,
        required: true
    }
})

const conversationInfo = mongoose.model("conversationInfo", conversationInfoSchema);

module.exports = conversationInfo;