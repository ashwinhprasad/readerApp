const { checkIfAllFieldsPresent } = require("../utils/general")
const pool = require("../db/dbConnection");
const addToLogs = require("../utils/logger");
const { invalOutvalConditionSatify } = require("../utils/shelfUtil");

const addBooksToShelf = async (req, res) => {
    const { bookId }  = req.params;
    if(!checkIfAllFieldsPresent(bookId)) {
        return res.status(400).send("Required param(s) missing");
    }
    const client = await pool.connect();
    try {
        
        const isBookAddedQuery = "SELECT status, owner FROM shelf WHERE id = $1";
        const result = await client.query(isBookAddedQuery, [bookId]);
        const canBookBeAdded = result["rows"][0]["status"] == 1;
        const isOwnedByUser = (result["rows"][0]["owner"] == req.user.id);

        if (!canBookBeAdded && !isOwnedByUser) {
            addToLogs(`Book - ${bookId} cannot be added`);
            return res.status(400).send(`Book - ${bookId} cannot be assigned to shelf`);
        }

        await client.query("BEGIN");
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



const removeBookFromShelf = async (req, res) => {
    const { bookId } = req.params;
    if (!checkIfAllFieldsPresent(bookId)) {
        return res.status(400).send("Required param(s) missing");
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const requiredBookAndOnerDetails = "SELECT shelf.owner, users.inval, users.outval, shelf.status, shelf.price FROM shelf JOIN users ON (shelf.owner = users.id) WHERE shelf.id = $1";
        const result = await client.query(requiredBookAndOnerDetails, [bookId]);
       
       
        const canBookBeRemoved = result["rows"][0]["status"] == 2;
        const isOwnedByUser = (result["rows"][0]["owner"] == req.user.id);
        if (!canBookBeRemoved && !isOwnedByUser) {
            addToLogs(`Book - ${bookId} cannot be removed`);
            return res.status(400).send(`Book - ${bookId} cannot be removed from shelf`);
        }


        const bookPrice = result["rows"][0]["price"];
        const inval = result["rows"][0]["inval"];
        const outval = result["rows"][0]["outval"];
        if (!invalOutvalConditionSatify(inval - bookPrice , outval)) {
            addToLogs(`Book - ${bookId} cannot be removed from shelf since doing so would not satisfy inval outval constraint`);
            return res.status(200).send("Book - ${bookId} cannot be removed from shelf since doing so would not satisfy inval outval constraint")
        }

        
        const removeBookFromShelf = "UPDATE shelf SET status = 1 WHERE id = $1";
        await client.query(removeBookFromShelf, [bookId]);

        const increaseInvalQuery = "UPDATE users SET inval = (inval - (select price from shelf WHERE id = $1)) WHERE ID = $2";
        await client.query(increaseInvalQuery, [bookId, req.user.id]);
        await client.query("COMMIT");

    } catch (e) {

        await client.query("ROLLBACK");
        addToLogs(`Exception while removing book ${bookId} from shelf:  `+JSON.stringify(e.message));
        return res.status(400).send(`Exception while removing book from shelf - ${bookId}`);

    } finally {
        client.release();
    }
    addToLogs(`Book: ${bookId} removed from shelf`);
    return res.status(200).send(`Book: ${bookId} removed from shelf`);
}


const retrieveLatestBooks = async (req, res) => {

    const client = await pool.connect();
    const listOfBooks = []
    try {
        
        const retrieveBooksFromShelfQuery = "select id, title, author, price from shelf WHERE status = 2 ORDER BY date_added DESC"
        const result = await client.query(retrieveBooksFromShelfQuery);

        for(let i=0;i<result.rowCount;i++) {
            listOfBooks.push({
                id:result["rows"][i]["id"],
                title:result["rows"][i]["title"],
                author:result["rows"][i]["author"],
                price:result["rows"][i]["price"]
            })
        }        

    } catch (e) {

        addToLogs(`Exception while retrieveing books  from shelf `+JSON.stringify(e.message));
        return res.status(400).send(`Exception while retrieving books from shelf`);

    } finally {
        client.release();
    }

    addToLogs("books successfully retrieved from shelf");
    return res.status(200).send(listOfBooks);

}


module.exports = { addBooksToShelf, removeBookFromShelf, retrieveLatestBooks }