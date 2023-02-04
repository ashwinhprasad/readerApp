const pool = require("../db/dbConnection")
const addToLogs = require("../utils/logger")
const hashUtil = require("../utils/hashUtil")
const jwt = require("jsonwebtoken")
const { access_token_secret } = require("../config")
const generalUtil = require("../utils/general")
const fs = require("fs")


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

        // try {
        //     fs.unlink(`./static/images/profile_pics/${req.file}`, () => {
        //         addToLogs('profile picture has been deleted')
        //     })
        // } catch (e) {
        //     addToLogs(JSON.stringify(e.message));
        // }

        await client.query("ROLLBACK");
        addToLogs('Exception while registering user'+JSON.stringify(e.message))
        return res.status(400).send("Error while creating account")

    } finally {
        client.release();
    }
    return res.status(201).send(`user created successfully : ${email}`);
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
    return res.status(200).send(req.user);
}




const deleteAccount = async (req,res) => {
    const client = await pool.connect();
    try {

        if (req.user) {
            
            const deleteQuery = "DELETE FROM users WHERE id = $1";
            await client.query(deleteQuery, [req.user.id]);

            fs.unlink(`./files/profile_pics/${req.user["email"]}_profile`, () => {
                addToLogs('profile picture has been deleted from user delete')
            })
        } else {
            return res.status(404).send(`User: ${req.user.id} does not exist or is already deleted`);
        }

    } catch (e){
        addToLogs("Exception while deleting user: "+JSON.stringify(e.message))
        return res.status(400).send("User Not Found")
    } finally {
        client.release();
    }
    return res.status(200).send(`User: ${req.user.id} successfully deleted`);
}



module.exports = { signUp, login, getUserDetails, deleteAccount }