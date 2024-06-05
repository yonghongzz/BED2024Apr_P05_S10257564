const express = require('express');
const usersController = require('./controllers/usersController');
const sql = require('mssql');
const dbConfig = require('./dbConfig');
const bodyParser = require('body-parser');
const validateUser = require('./middlewares/validateUser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/users",usersController.getAllUsers);
app.get("/users/:id",usersController.getUserById);
app.post("/users",validateUser, usersController.createUser);
app.put("/users/:id", usersController.updateUser); 
app.delete("/users/:id", usersController.deleteUser);
app.get("/users/search", usersController.searchUsers);  
app.get("/users/with-books", usersController.getUsersWithBooks);   

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

