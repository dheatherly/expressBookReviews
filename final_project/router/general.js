const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const getBooks = new Promise(resolve => resolve(res.status(200).json(books)));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const getBook = new Promise((resolve, reject) => {
        const isbn = req.params.isbn;

        if (books[isbn]) {
            resolve(res.status(200).json(books[isbn]));
        } else {
            reject(res.status(404).json({ message: `ISBN not found: ${isbn}` }));
        }
    });
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        const author = req.params.author;
        const booksOfAuthor = Object.values(books).filter(book => book.author === author);
    
        if (booksOfAuthor.length > 0) {
            resolve(res.status(200).json(booksOfAuthor));
        } else {
            reject(res.status(404).json({ message: `Author not found: ${author}` }));
        }
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        const title = req.params.title;
        const booksWithTitle = Object.values(books).filter(book => book.title === title);
    
        if (booksWithTitle.length > 0) {
            resolve(res.status(200).json(booksWithTitle));
        } else {
            reject(res.status(404).json({ message: `Title not found: ${title}` }));
        }
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    return res.status(200).json(books[req.params.isbn].reviews);
});

module.exports.general = public_users;
