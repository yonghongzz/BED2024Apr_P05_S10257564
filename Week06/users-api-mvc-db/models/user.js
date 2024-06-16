const dbConfig = require("../dbConfig");
const sql = require("mssql");

class User {
    constructor(id,username,email){
        this.id = id;
        this.username = username;
        this.email = email;
    }

    static async getAllUsers(){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users`;
        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new User(row.id,row.username,row.email)
        );
    }

    static async getUserById(id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM User WHERE id = @id`;
        const request = connection.request();
        request.input("id",id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
        ? new User(
            result.recordset[0].id,
            result.recordset[0].username,
            result.recordset[0].email
        )
        : null;
    }

    static async createUser(newUserData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO User (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY() AS id;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("username", newUserData.username);
        request.input("email", newUserData.email);
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created book using its ID
        return this.getUserById(result.recordset[0].id);
      }

    
    static async updateUser(id, newUserData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE User SET username = @username, email = @email WHERE id = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        request.input("username", newUserData.username || null); // Handle optional fields
        request.input("email", newUserData.email || null);

        await request.query(sqlQuery);

        connection.close();

        return this.getUserById(id); // returning the updated User data
    }

    static async deleteUser(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM User
         WHERE id = @id`; // Parameterized query

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

module.exports = User;