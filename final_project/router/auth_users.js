const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
	const userMatches = users.filter((user) => user.username === username);
	return userMatches.length > 0;
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) { 
		return res.status(404).json({ message: "Error logging in" }); 
	}

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { data: password },
            'access',
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

//  Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const username = req.session.authorization.username;
	const isbn = req.params.isbn;
	const review = req.body.review;

	if (books[isbn]) {
		let book = books[isbn];
		book.reviews[username] = review;
		return res.status(200).send("Review added successfully");
	} else {
		return res.status(404).json({ message: `ISBN not found: ${isbn}`});
	}
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve username from session
    const book = Object.values(books).find(book => book.isbn === isbn);
    const bookReviews = book.reviews;

    if (!book) {
        res.send(`ISBN not found: ${isbn}`);
    } else if (!username) {
        res.send(`User not logged in`);
    } else {
        const userReviewIndex = bookReviews.findIndex(review => review.username === username);

        if (userReviewIndex !== -1) {
            bookReviews.splice(userReviewIndex, 1);
            res.send(`Review deleted for ISBN: ${isbn}`);
        } else {
            res.send(`The user has no review on book with ISBN: ${isbn}`);
        }
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
