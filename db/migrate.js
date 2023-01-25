const { Client } = require('pg');
const { password } = require('./dbConfig')

const client  = new Client({
    user: 'ashwinhprasad',
    host: 'localhost',
    database: 'readerappdb',
    password: password,
    port: 5432,
})


async function createTables () {
    
    await client.connect()

    //create users tables
    await client.query("\
        CREATE TABLE IF NOT EXISTS users ( \
        id SERIAL PRIMARY KEY,\
        username VARCHAR(50) NOT NULL,\
        email VARCHAR(100) UNIQUE NOT NULL,\
        password VARCHAR(100) NOT NULL,\
        salt VARCHAR(100) NOT NULL, \
        phoneNo VARCHAR(10) UNIQUE NOT NULL,\
        address TEXT NOT NULL, \
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,\
        role SMALLINT NOT NULL DEFAULT 0, \
        inval INT NOT NULL DEFAULT 0, \
        outval INT NOT NULL DEFAULT 0, \
        profilePic BYTEA DEFAULT NULL \
        );"
    ).then(res => {
        console.log("User Table Created")
    }).catch(err => console.log(err.stack))



    // create table genre
    await client.query("\
    CREATE TABLE IF NOT EXISTS genre( \
        id SERIAL PRIMARY KEY, \
        name VARCHAR(50) NOT NULL \
    );"
    ).then(res => {
        console.log("Genre Table Populated")
    }).catch(err => console.log(err.stack))



    //create shelf table
    await client.query("\
        CREATE TABLE IF NOT EXISTS shelf ( \
        id SERIAL PRIMARY KEY,\
        title VARCHAR(100) NOT NULL,\
        author VARCHAR(100) ,\
        price INT NOT NULL,\
        owner INT NOT NULL, \
        number_of_transactions INT NOT NULL DEFAULT 0,\
        date_added DATE NOT NULL DEFAULT CURRENT_DATE,\
        STATUS INT NOT NULL DEFAULT 1, \
        genre_id INT, \
        CONSTRAINT book_owner_fk FOREIGN KEY(owner) REFERENCES users(id), \
        CONSTRAINT book_genre_fk FOREIGN KEY(genre_id) REFERENCES genre(id) ON DELETE SET NULL \
        );"
        ).then(res => {
        console.log("The Shelf is set-up")
    }).catch(err => console.log(err.stack))


    // create transaction table
    await client.query("\
    CREATE TABLE IF NOT EXISTS transactions ( \
        id SERIAL PRIMARY KEY,\
        book_id INT NOT NULL,\
        status INT NOT NULL ,\
        buyer_id INT NOT NULL,\
        CONSTRAINT transaction_book_fk FOREIGN KEY(book_id) REFERENCES shelf(id), \
        CONSTRAINT transaction_buyer_fk FOREIGN KEY(buyer_id) REFERENCES users(id) \
    );"
    ).then(res => {
        console.log("Transaction table is set-up")
    }).catch(err => console.log(err.stack))


    // create book_requsts
    await client.query("CREATE TABLE IF NOT EXISTS book_requests(" +
    "id SERIAL PRIMARY KEY," +
    "request_user_id INT NOT NULL," +
    "book_id INT NOT NULL," +
    "time TIMESTAMP NOT NULL DEFAULT NOW()," +
    "STATUS INT NOT NULL DEFAULT 1," +
    "CONSTRAINT request_user_fk FOREIGN KEY(request_user_id) REFERENCES users(id)," +
    "CONSTRAINT request_book_fk FOREIGN KEY(book_id) REFERENCES shelf(id)"+
    ")"
    ).then(res => {
        console.log("book_requests table is set up")
    }).catch(err => console.log(err))

    // create user_book_rating_matrix
    await client.query("CREATE TABLE IF NOT EXISTS user_book_rating_matrix (" +
    "id SERIAL PRIMARY KEY," +
    "user_id INT NOT NULL," +
    "book_id INT NOT NULL," +
    "rating INT NOT NULL DEFAULT 0," +
    "CONSTRAINT rating_user_fk FOREIGN KEY(user_id) REFERENCES users(id)," +
    "CONSTRAINT rating_book_dk FOREIGN KEY(book_id) REFERENCES shelf(id)" +
    ")").then(res => {
        console.log("user_book_rating_matrix table created");
    }).catch(err => console.log(err));

    await client.end();

}

createTables();







