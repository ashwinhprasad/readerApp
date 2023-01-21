const { Client } = require('pg');
const { password } = require('./dbConfig')


const client  = new Client({
    user: 'ashwinhprasad',
    host: 'localhost',
    database: 'readerappdb',
    password: password,
    port: 5432,
})

client.connect()

async function destroyTables() {


    await client.query("DROP TABLE IF EXISTS transactions;")
    .then(res => console.log("genre table has been dropped"))
    .catch(err => console.log(err));

    await client.query("DROP TABLE IF EXISTS book_requests;")
    .then(res => console.log("genre table has been dropped"))
    .catch(err => console.log(err));

    await client.query("DROP TABLE IF EXISTS user_book_rating_matrix;")
    .then(res => console.log("genre table has been dropped"))
    .catch(err => console.log(err));

    await client.query("DROP TABLE IF EXISTS shelf;")
    .then(res => console.log("the shelf has been destroyed"))
    .catch(err => console.log(err));

    await client.query("DROP TABLE IF EXISTS genre;")
    .then(res => console.log("genre table has been dropped"))
    .catch(err => console.log(err));

    await client.query("DROP TABLE IF EXISTS users;")
    .then(res => console.log("user table has been dropped"))
    .catch(err => console.log(err));

    await client.end()
}

destroyTables();


