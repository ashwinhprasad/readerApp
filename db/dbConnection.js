const { Pool } = require("pg");
const { user, host, port, database, password } = require('./dbConfig')


const pool = new Pool({
    user,
    password,
    host, 
    port,
    database
})

console.log("DB Connected Succesfully")
module.exports = pool