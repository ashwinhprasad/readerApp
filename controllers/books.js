const generalUtil = require("../utils/general");
const addToLogs = require("../utils/logger");
const pool = require("../db/dbConnection");
const e = require("express");

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


// TO-DO : Add code for retrieved books from the shelf once retrieveBook is done.
const retrieveUserBooksInfo = async (req, res) => {

    const client = await pool.connect();
    const listOfUserAddedBooks = [];
    const listOfUserRetrievedBooks = [];

    try {
        
        const userBookInfoQuery = "SELECT id, title, author, price, status FROM shelf WHERE owner = $1";
        const result = await client.query(userBookInfoQuery, [req.user.id]);
        
        for(let i=0;i<result.rowCount;i++) {
            listOfUserAddedBooks.push({
                id:result.rows[i]["id"],
                title:result.rows[i]["title"],
                author:result.rows[i]["author"],
                price:result.rows[i]["price"],
                status:result.rows[i]["status"],
            })
        }

        // retrieved books from shelf


    } catch (e) {

        addToLogs("Exception while retrieving user books info: "+JSON.stringify(e.message));
        return res.status(400).send("Exception while retrieving user books info");

    } finally {
        client.release();
    }

    addToLogs("User Book Details Retrieved Successfully");
    return res.status(200).json({
        listOfUserAddedBooks,
        listOfUserRetrievedBooks
    })

}


// not finished yet, have to continue after finishing book request
const retrieveBookDetails = async (req,res) => {
    const { bookId } = req.params;
    const client = await pool.connect()
    try {
        const getBookDetailsQuery = "SELECT \
        shelf.id AS shelf_id, shelf.title, shelf.author, shelf.price, shelf.number_of_transactions, shelf.date_added, shelf.status AS shelf_status , genre.id AS genre_id, genre.name, users.id AS user_id, users.email, br.id AS book_request_id, br.status AS book_request_status \
        FROM shelf \
        JOIN genre ON (genre.ID = shelf.genre_id) \
        JOIN users ON (shelf.owner = users.id) \
        LEFT OUTER JOIN book_requests br ON (br.book_id = shelf.id) \
        WHERE shelf.id = $1";
        const result = await client.query(getBookDetailsQuery, [bookId]);
        if (result.rowCount != 0) {

        }
    } catch (e) {
        addToLogs(`Exception while fetching Book Details for book_${bookId} : `+JSON.stringify(e.message));
        return res.status(400).send(`Exception while fetching Book Details for book_${bookId} : `+JSON.stringify(e.message))
    } finally {
        client.release();
    }


}

module.exports = { addBooks, retrieveUserBooksInfo, retrieveBookDetails }