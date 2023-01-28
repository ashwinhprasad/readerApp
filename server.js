// imports
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload")

// configs
const PORT = 3000

// middlewares
app.use(fileUpload())
app.use(express.json())

// routes
app.use("/api/users", require("./routes/users"));
app.use("/api/books", require("./routes/books"));
app.use("/api/shelf", require("./routes/shelf"));


// server start
app.listen(PORT, () => {
	console.log(`Server Started at PORT: ${PORT}`);
})
