const jwt = require("jsonwebtoken")
const { access_token_secret} = require("../config");
const pool = require("../db/dbConnection");

const isAuthenticated = async (req,res, next) => {
    
    if (!req.headers.authorization) {
        return res.status(400).send("Token not found");
    }

    let token = req.headers.authorization.split(' ')[1]
    const client = await pool.connect();
    try {
        let decoded = jwt.verify(token, access_token_secret)
        const result = await client.query("SELECT id, username, email, phoneno, address, \
        created_at, role, inval, outval FROM users WHERE id = $1",[decoded.id])
        if (result.rowCount == 1) {
            req.user = {
                id:result.rows[0]["id"],
                username:result.rows[0]["username"],
                email:result.rows[0]["email"],
                phoneno:result.rows[0]["phoneno"],
                address:result.rows[0]["address"],
                role:result.rows[0]["role"],
                inval:result.rows[0]["inval"],
                outval:result.rows[0]["outval"],
                created_at:result.rows[0]["created_at"]
            }
        } else {
            return res.status(400).send("User does not exist");
        }
        next()
    } catch(e) {
        return res.status(400).send("Invalid Token");
    } finally {
        client.release();
    }
}


module.exports = {isAuthenticated}