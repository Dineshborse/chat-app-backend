const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const userInfo = require("../modals/userModal");
const conversationInfo = require("../modals/conversationModal")
const messagesInfo = require("../modals/messagesModal");

const { generatePasswordHash, checkIfUserExists, checkUserPassword } = require("../utility");

const notificationsMap = new Map();

router.post("/register", async (req, res) => {
    // console.log(req.body.useremail, req.body.password)
    // console.log(await checkIfUserExists(req.body.useremail))
    if (await checkIfUserExists(req.body.useremail)) {
        res.status(400).send({ status: "failed", message: "user email already exists" })
    }
    else {
        let passwordHash = await generatePasswordHash(req.body.password);
        console.log(passwordHash)
        userInfo.create({ useremail: req.body.useremail, password: passwordHash, userName: req.body.username }).then((val) => {
            console.log(val);
            res.status(200).send({ status: "success", message: "User registered successfully" })
        }).catch((err) => {
            console.log(err)
            res.status(500).send({ status: "failed", message: "Server DB error" })
        })
    }
})


router.post("/login", async (req, res) => {
    userInfo.find({ useremail: req.body.useremail }).then(users => {
        if (users.length) {
            checkUserPassword(req.body.useremail, req.body.password).then((val => {
                if (val) {
                    console.log(val)
                    try {
                        let token = jwt.sign(req.body.useremail, process.env.SECRET_KEY);
                        res.status(200).send({ status: "success", token: token, userName: users[0].userName, userEmail:users[0].useremail })
                    }
                    catch (err) {
                        console.log(err)
                        res.status(400).send({ status: "failed", message: "server error" })
                    }
                }
                else {
                    res.status(400).send({ status: "failed", message: "password mismatch" })
                }
            }));
        }
        else {
            res.status(400).send({ status: "failed", message: "invalid user" })
        }

    })

})



router.get("/userchat", async (req, res) => {
    try {
        // console.log(req.headers.authorization)
        let userEmail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
        let sender = userEmail;
        userInfo.find({ useremail: userEmail }).then((users) => {
            if (users.length) {
                conversationInfo.find().then((conversations) => {
                    // if (conversations.length) {

                    res.status(200).send({
                        status: "success",
                        conversationsData: conversations,
                        userName: users[0].userName,
                        userEmail: users[0].useremail
                    })
                    // }
                    // else {
                    //     res.status(400).send({ status: "failed", message: "invalid conversation id" })

                    // }
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({ status: "failed", message: "server error" })
                })
            }
            else {
                req.status.send({ status: "failed", message: "invalid user error" })
            }
        });
    }

    catch (e) {
        console.log(e)
    }
})


router.post("/all-conversation-messages", async (req, res) => {
    try {
        console.log(req.body.conversationId)
        let userEmail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);

        userInfo.find({ useremail: userEmail }).then((users) => {
            if (users.length) {
                messagesInfo.find({ conversationId: req.body.conversationId }).then((messages) => {
                    
                    // if (conversations.length) {
                    console.log(messages)
                    conversationInfo.find({ conversationId: req.body.conversationId }).then(conversationDetails=>{
                        res.status(200).send({
                            status: "success",
                            conversationMesages: messages,
                            conversationDetails:conversationDetails[0],
                            username: users[0].userName,
                            useremail: users[0].useremail
                        })
                    })
                    
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({ status: "failed", message: "server error" })
                })
            }
            else {
                req.status.send({ status: "failed", message: "invalid user error" })
            }
        });
    }

    catch (e) {
        console.log(e)
    }
})


// router.get("/allusers", async (req, res) => {
//     try {
//         // console.log(req.headers.authorization)
//         let userEmail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
//         let sender = userEmail;
//         userInfo.find({ useremail: userEmail }).then((users) => {
//             if (users.length) {
//                 userInfo.find().then((users) => {
//                     let AllUserEmail=
//                     // if (conversations.length) {

//                         res.status(200).send({ 
//                             status: "success", 
//                             response: conversations[0], 
//                             username: users[0].userName, 
//                             useremail: users[0].useremail })
//                     // }
//                     // else {
//                     //     res.status(400).send({ status: "failed", message: "invalid conversation id" })

//                     // }
//                 }).catch((err) => {
//                     console.log(err);
//                     res.status(500).send({ status: "failed", message: "server error" })
//                 })
//             }
//             else {
//                 req.status.send({ status: "failed", message: "invalid user error" })
//             }
//         });
//     }

//     catch (e) {
//         console.log(e)
//     }
// })

router.post("/new-conversation", async (req, res) => {
    try {
        let userEmail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
        let membersArr = [req.body.user2ndPartyEmail];

        if (await checkIfUserExists(userEmail)) {
            membersArr.push(userEmail);
            membersArr.sort();
            userInfo.find({ useremail: req.body.user2ndPartyEmail }).then((users) => {
                if (users.length) {
                    conversationInfo.find({ members: membersArr }).then((conversations) => {
                        if (conversations.length) {
                            res.status(400).send({ status: "failed", message: "conversation already exists", conversation: conversations[0] })
                        }
                        else {
                            conversationInfo.create({ members: membersArr, updateTime: new Date() }).then((val) => {
                                console.log(val);
                                res.status(200).send({ status: "success", data: val })
                            })
                        }
                    })
                }
            })

        }
        else {
            req.status.send({ status: "failed", message: "invalid error" })
        }
    }
    catch (e) {

    }
})


router.post("/new-message", async (req, res) => {
    try {
        let userEmail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
        let sender = userEmail;
        if (await checkIfUserExists(userEmail)) {
            conversationInfo.find({ _id: req.body.conversationId }).then((conversations) => {
                if (conversations.length) {
                    messagesInfo.create({
                        conversationId: conversations[0]._id,
                        senderId: sender,
                        message: req.body.message,
                        date: new Date(),
                        messageType: req.body.messageType
                    }).then(async (val) => {
                        await conversationInfo.updateOne({ _id: req.body.conversationId },
                            { $set: { unreadMessages: conversations[0].unreadMessages + 1 } })
                            .catch((err) => { console.log(err) })

                        res.status(200).send({ status: "success", messageData: val })
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).send({ status: "failed", message: "server error" })
                    })
                }
                else {
                    res.status(400).send({ status: "failed", message: "invalid conversation id" })

                }
            }).catch((err) => {
                console.log(err);
                res.status(400).send({ status: "failed", message: "invalid conversation id" })
            })
        }
        else {
            req.status.send({ status: "failed", message: "invalid user error" })
        }
    }
    catch (e) {

    }
})


router.post("/notify", (req, res) => {
    const sender = req.body.sender;
    const resTimeoutId = setTimeout(() => {
        console.log("inside timeout")
        const [preRes, preResTimeoutId] = notificationsMap.get(req.body.sender);
        console.log("preRes","sending notificaion")
        preRes.status(200).send({ status: "success", message: "this notification is working" })
        notificationsMap.delete(sender)
    }, 60000);
    if (notificationsMap.has(req.body.sender)) {
        const [preRes, preResTimeoutId] = notificationsMap.get(req.body.sender);
        preRes.send(  {message:"clearing previous notification"} )
        clearTimeout(preResTimeoutId);
        notificationsMap.set(req.body.sender, [res, resTimeoutId]);
    }
    else {
        notificationsMap.set(req.body.sender, [res, resTimeoutId]);
    }
});




module.exports = router;