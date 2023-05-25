const bcryptjs = require("bcryptjs");

const salt = 7;
const userInfo = require("./modals/userModal");

const generatePasswordHash = async (password) => {
    console.log(password)
    let hash;
    await bcryptjs.genSalt(salt).then(async (saltHash) => {
        await bcryptjs.hash(password, saltHash).then((passwordHash) => {
            console.log(passwordHash)
            hash = passwordHash;
        })
    }).catch((err) => {
        console.log("generatePasswordHash", err)
    })
    return hash;
}


const checkIfUserExists = async (email) => {
    let userExist = false;
    await userInfo.find({ useremail: email }).then(users => {
        if (users.length) {
            userExist = true;
        }
    })
    return userExist;
}
const checkUserPassword = async (email, password) => {
    let isPasswordMatching = false;
    await userInfo.find({ useremail: email }).then(async (users) => {
        if (users.length) {
            await bcryptjs.compare(password, users[0].password).then((val) => {
                // console.log(val);
                isPasswordMatching = val;
            })
        }
    })
    return isPasswordMatching;
}


module.exports = { generatePasswordHash, checkIfUserExists, checkUserPassword }