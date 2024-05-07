const express = require('express');
const booksController = require('./controllers/booksController');
const sql = require('mssql');
const dbConfig = require('./dbConfig');
const bodyParser = require('body-parser');
const validateBook = require('./middlewares/validateBook');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/books",booksController.getAllBooks);
app.get("/books/:id",booksController.getBookById);
app.post("/books",validateBook, booksController.createBook);
app.put("/books/:id", booksController.updateBook); 
app.delete("/books/:id", booksController.deleteBook);

app.listen(port,async() => {
    try{
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    }catch(err){
        console.error("Database connection error:",err);
        process.exit(1);
    }
    console.log(`Server is listening on port ${port}`);
});

process.on("SIGINT", async() => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});     

