const mongoose = require("mongoose");

const imageInfoSchema = new mongoose.Schema({
    imageData: {
        type: String,
        required: true
    },
    imageName:{
        type:String,
        required: true
    }
})

const imageInfo = mongoose.model("imageInfo", imageInfoSchema);

module.exports = imageInfo;