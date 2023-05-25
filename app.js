const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const userInfo = require("./modals/userModal");
const conversationInfo = require("./modals/conversationModal")
const messagesInfo = require("./modals/messagesModal");
require("dotenv").config();
// const crypto = require("crypto");
// console.log(crypto.randomBytes(128).toString("hex"));

const userController = require("./routes/user");

//for supporting json(body parser middleware)
app.use(cors());
app.use(express.json({ limit: "30mb" }))
app.use(express.urlencoded({ limit: "30mb", extended: true }))


mongoose.connect("mongodb+srv://dineshborse:mangalborse@cluster0.umsb4.mongodb.net/chat-app?retryWrites=true&w=majority").then((data) => {
    console.log("connected to database")
}).catch((err) => {
    console.log(err);
})
app.listen(process.env.PORT || 3006, (err) => {
    if (!err) {
        console.log("server started on port 3006");
    }
    else {
        console.log(err);
    }
})

// app.get("/",(req,res,next)=>{
//     res.send("this is chat app")
// })
// app.post("/",(req,res,next)=>{
//     console.log("inside")
// })

app.use("/user",userController);