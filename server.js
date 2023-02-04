// imports
const express = require("express");
const app = express();
const path = require("path")
const cors = require("cors")

// configs
const PORT = 5000

// middlewares
app.use(cors())
app.use(express.json())

// static files storage
app.use("/static", express.static(path.join(__dirname,"static")))


// routes
app.use("/api/users", require("./routes/users"));
app.use("/api/books", require("./routes/books"));
app.use("/api/shelf", require("./routes/shelf"));


// server start
app.listen(PORT, () => {
	console.log(`Server Started at PORT: ${PORT}`);
})