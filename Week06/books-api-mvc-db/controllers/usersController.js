const User = require("../models/user");

const getAllUsers = async (req,res) => {
    try{
        const users = await User.getAllUsers();
        res.json(users);
    }catch (error){
        console.error(error);
        res.status(500).send("Error retrieving Users");
    }
};

const getUserById = async (req, res) => {
    const UserId = parseInt(req.params.id);
    try {
      const User = await User.getUserById(UserId);
      if (!User) {
        return res.status(404).send("User not found");
      }
      res.json(User);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving User");
    }
  };

  const createUser = async (req, res) => {
    const newUser = req.body;
    try {
      const createdUser = await User.createUser(newUser);
      res.status(201).json(createdUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating User");
    }
  };

  const updateUser = async (req, res) => {
    const UserId = parseInt(req.params.id);
    const newUserData = req.body;
  
    try {
      const updatedUser = await User.updateUser(UserId, newUserData);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating User");
    }
  };
  
  const deleteUser = async (req, res) => {
    const UserId = parseInt(req.params.id);
  
    try {
      const success = await User.deleteUser(UserId);
      if (!success) {
        return res.status(404).send("User not found");
      }
      res.status(204).send("Delete successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting User");
    }
  };

  async function searchUsers(req, res) {
    const searchTerm = req.query.searchTerm; // Extract search term from query params
  
    try {
      const users = await User.searchUsers(searchTerm);
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error searching users" });
    }
  }

  async function getUsersWithBooks(req, res) {
    try {
      const users = await User.getUsersWithBook();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching users with books" });
    }
  }
  
  module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersWithBooks
  };