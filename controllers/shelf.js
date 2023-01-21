const { checkIfAllFieldsPresent } = require("../utils/general")
const pool = require("../db/dbConnection");
const addToLogs = require("../utils/logger");

const addBooksToShelf = async (req, res) => {
    const { bookId }  = req.params;
    if(!checkIfAllFieldsPresent(bookId)) {
        return res.status(400).send("Required param(s) missing");
    }
    const client = await pool.connect();
    try {
        
        const isBookAddedQuery = "SELECT status FROM shelf WHERE id = $1";
        const result = await client.query(isBookAddedQuery, [bookId]);
        const canBookBeAdded = result["rows"][0]["status"] == 1;

        if (!canBookBeAdded) {
            addToLogs(`Book - ${bookId} cannot be added`);
            return res.status(400).send(`Book - ${bookId} cannot be assigned to shelf`);
        }

        const addToShelfQuery = "UPDATE shelf SET status = 2 WHERE id = $1";
        await client.query(addToShelfQuery, [bookId]);

        const increaseInvalQuery = "UPDATE users SET inval = (inval + (select price from shelf WHERE id = $1)) WHERE ID = $2";
        await client.query(increaseInvalQuery, [bookId, req.user.id]);
        await client.query("COMMIT");
    
    } catch (e) {
        
        await client.query("ROLLBACK");
        addToLogs(`Exception while assigning book ${bookId}:  `+JSON.stringify(e.message));
        return res.status(400).send(`Exception while assigning book to shelf - ${bookId}`);

    } finally {
        client.release();
    }
    addToLogs(`Book: ${bookId} assigned to shelf`);
    return res.status(200).send(`Book: ${bookId} assigned to shelf`);
}


module.exports = { addBooksToShelf }