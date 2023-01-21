const pool = require("../db/dbConnection")
const addToLogs = require("../utils/logger")
const hashUtil = require("../utils/hashUtil")
const jwt = require("jsonwebtoken")
const { access_token_secret } = require("../config")
const generalUtil = require("../utils/general")


const signUp = async (req,res) => {
    const { name, email, phoneNo, password, address } = req.body;
    
    if (!generalUtil.checkIfAllFieldsPresent(name, email, phoneNo, password, address)) {
        return res.status(400).send("Required Parameter(s) Missing");
    }
    const {hash, salt} = await hashUtil.generateHash(password)
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const createUserQuery = "INSERT INTO users(username, email, phoneno, password, address, salt) VALUES ($1, $2, $3, $4, $5, $6)";
        await client.query(createUserQuery, [name, email, phoneNo, hash, address, salt])
        await client.query("COMMIT")
        addToLogs(`User Successfully Created: ${name} - ${email}`)
    } catch (e) {
        await client.query("ROLLBACK");
        addToLogs('Exception while registering user'+JSON.stringify(e.message))
        return res.status(400).send("Error while creating account")
    } finally {
        client.release();
    }
    return res.status(201).send(req.body)
}

const login = async (req,res) => {
    const client = await pool.connect();
    const { email, password } = req.body;
    try {
        await client.query("BEGIN")
        const result = await client.query("select id, username, email,  outval, inval, password, salt from users where email = $1",[email])
        if (result.rowCount != 0){
            const isValid = await hashUtil.compareHash(password,result.rows[0]['salt'],result.rows[0]['password'])
            if (isValid === true) {
                const token = jwt.sign({
                    "id":result["rows"][0]['id']}, access_token_secret)
                res.status(201).send({
                    "id":result["rows"][0]['id'],
                    "email":result["rows"][0]['email'],
                    "username":result["rows"][0]['username'],
                    "inval":result["rows"][0]['inval'],
                    "outval":result["rows"][0]['outval'],
                    "access_token":token})
            } else {
                res.status(400).send("Incorrect Password")
            } 
        } else {
            res.status(400).send("Email does not exists")
        }
        await client.query("COMMIT")
    } catch (e) {
        await client.query("ROLLBACK")
        addToLogs("Exception While Logging in : "+JSON.stringify(e.message))
        res.status(400).send("Authentication failure")
    } finally {
        client.release();
    }
}


const getUserDetails = async (req,res) => {
    const client = await pool.connect();
    await client.query("BEGIN")
    const user = {}
    try {
        const result = await client.query("SELECT id, username, email, phoneno, address, \
        created_at, role, inval, outval FROM users WHERE id = $1",[req.user.id])
        user["id"] = result.rows[0]['id']
        user["username"] = result.rows[0]['username']
        user["email"] = result.rows[0]['email']
        user["phoneno"] = result.rows[0]['phoneno']
        user["address"] = result.rows[0]['address']
        user["created_at"] = result.rows[0]['created_at']
        user["role"] = result.rows[0]['role']
        user["inval"] = result.rows[0]['inval']
        user["outval"] = result.rows[0]['outval']
        res.status(200).send(user)
    } catch (e) {
        await client.query("ROLLBACK");
        addToLogs("Exception while retrieving user details : "+JSON.stringify(e.message))
        res.status(400).send("User Not Found")
    } finally {
        client.release();
    }
}

module.exports = { signUp, login, getUserDetails }