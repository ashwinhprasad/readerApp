const jwt = require("jsonwebtoken")
const { access_token_secret} = require("../config")

const isAuthenticated = async (req,res, next) => {
    
    if (!req.headers.authorization) {
        return res.status(400).send("Token not found");
    }

    let token = req.headers.authorization.split(' ')[1]
    try {
        let decoded = jwt.verify(token, access_token_secret)
        req.user = decoded
        next()
    } catch(e) {
        return res.status(400).send("Invalid Token")
    }
}


module.exports = {isAuthenticated}