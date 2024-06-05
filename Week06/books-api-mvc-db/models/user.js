const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Book {
    constructor(id,title,author){
        this.id = id;
        this.title = title;
        this.author = author;
    }

    static async getAllBooks(){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Books`;
        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new Book(row.id,row.title,row.author)
        );
    }

    static async getBookById(id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Books WHERE id = @id`;
        const request = connection.request();
        request.input("id",id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
        ? new Book(
            result.recordset[0].id,
            result.recordset[0].title,
            result.recordset[0].author
        )
        : null;
    }

    static async createBook(newBookData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("title", newBookData.title);
        request.input("author", newBookData.author);
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created book using its ID
        return this.getBookById(result.recordset[0].id);
      }

    
    static async updateBook(id, newBookData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Books SET title = @title, author = @author WHERE id = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        request.input("title", newBookData.title || null); // Handle optional fields
        request.input("author", newBookData.author || null);

        await request.query(sqlQuery);

        connection.close();

        return this.getBookById(id); // returning the updated book data
    }

    static async deleteBook(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM Books WHERE id = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; // Indicate success based on affected rows
    }

    static async searchUsers(searchTerm){
        const connection = await sql.connect(dbConfig);

        try{
            const query = `SELECT * FROM Users WHERE username LIKE %${searchTerm}% OR email LIKE %${searchTerm}%`;
            const result = await connection.request().query(query);
            return result.recordset;
        }
        catch (error){
            throw new error("Error searching users");
        }
        finally{
            await connection.close();
        }
    }

    static async getUsersWithBook(){
        const connection = await sql.connect(dbConfig);

        try{
            const query = `
            SELECT u.id AS user_id, u.username, u.email, b.id AS book_id, b.title, b.author
            FROM Users u LEFT JOIN UserBooks ub ON u.id = ub.user_id
            LEFT JOIN Books b ON ub.book_id = b.id
            ORDER BY u.username;`;
            const result = connection.request().query(query);
            
            const usersWithBooks = {};
            for (const row of result.recordset){
                const userId = row.user_id;
                if(!usersWithBooks[userId]){
                    usersWithBooks[userId] = {
                        id: userId,
                        username: row.username,
                        email: row.email,
                        books: []
                    };
                }
                usersWithBooks[userId].books.push({
                    id: row.book_id,
                    title: row.title,
                    author: row.author
                });
            }
            return Object.values(usersWithBooks);
        }
        catch(error){
            throw new Error("Error fetching users with books");
        }
        finally{
            await connection.close();
        }
    }
}

module.exports = Book;