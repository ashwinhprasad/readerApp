const generalUtil = require("../utils/general");
const addToLogs = require("../utils/logger");
const pool = require("../db/dbConnection");

const addBooks = async (req, res) => {
    const { title, author, price, genreId } = req.body;
    if (!generalUtil.checkIfAllFieldsPresent(title, author, price, genreId)) {
        return res.status(400).send("Required Param(s) missing");
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const bookAddQuery = "INSERT INTO shelf(title, owner , author, price, genre_id) VALUES ($1, $2, $3, $4, $5)";
        await client.query(bookAddQuery, [title, req.user.id, author , price, genreId]);
        await client.query("COMMIT");
    } catch (e) {
        await client.query("ROLLBACK");
        addToLogs("Exception while adding book: "+JSON.stringify(e.message));
        return res.status(400).send("Exception while adding Book");
    } finally {
        client.release();
    }
    addToLogs("Added Book Successfully");
    return res.status(200).send("Added Book Successfully");

}

module.exports = { addBooks }