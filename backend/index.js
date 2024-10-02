//==========================================
import express, { json } from "express";
import { config } from 'dotenv';

import jwtpkg from 'node-jsonwebtoken';
const { sign, verify } = jwtpkg;

import corspkg from 'cors'; // Fixing some potential network errors
const cors = corspkg;

import { getAllUsers, getUserById, addNewUser, getPassword, deleteUser } from "./routes/users.js"
import { addNewBook, getAllBooks, getBookById, deleteBook } from "./routes/books.js"
import { getUsersFavorites, addBookToUsersFavorite, removeBookFromUsersFavorite } from "./routes/favorites.js"

//==========================================

const app = express()
const PORT = 1234

config() // Setup env variables

// Middleware
app.use(cors())
app.use(json())
app.use((req, res, next) => {
	console.log('%s %s %s', req.method, req.url, req.body)
	next()
})

//==========================================

// Running the api
app.listen(PORT, () => {
	console.log(`Listening on localhost:${PORT}`)
})

//==========================================

app.get("/api/test", async (req, res) => {
	const token = req.headers.authorization

	res.status(418).send({
		"tok": token,
		"val": isTokenValid(token),
		"adm": await isTokenAdmin(token),
	})
})

// GET
app.get("/api/users/", async (req, res) => {
	let result = await getAllUsers()
	res.status(200).send(result)
})

app.get("/api/users/:id", async (req, res) => {
	const { id } = req.params

	let result = await getUserById(id)
	if (!result) {
		sendError(res, 404, "User not found")
		return
	}

	res.status(200).send(result)
})

app.get("/api/users/:id/favorites", async (req, res) => {
	const { id } = req.params

	let result = await getUsersFavorites(id)
	// if (!result) {
	// 	sendError(res, 404, "User not found")
	// 	return
	// }

	res.status(200).send(result)
})

app.get("/api/books/", async (req, res) => {
	let result = await getAllBooks()
	res.status(200).send(result)
})

app.get("/api/books/:id", async (req, res) => {
	const { id } = req.params

	let result = await getBookById(id)
	if (!result) {
		sendError(res, 404, "Book not found")
		return
	}

	res.status(200).send(result)
})

// POST
app.post("/api/users/register", async (req, res) => {
	const { pseudo, email, pwd } = req.body

	if (!pseudo || !email || !pwd) {
		sendError(res, 400, "Missing name, mail and/or password field.")
		return
	}

	let { error, insertId } = await addNewUser(pseudo, email, pwd)
	if (error) {
		sendError(res, 400, error)
		return
	}

	res.status(201).send({
		"message": "New user created",
		"user_id": insertId
	})
})

app.post("/api/users/login", async (req, res) => {
	const { pseudo, pwd } = req.body

	if (!pseudo || !pwd) {
		sendError(res, 400, "Missing name and/or password field.")
		return
	}
	
	let { user_pwd, user_id } = await getPassword(pseudo)
	if (user_pwd !== pwd) {
		sendError(res, 400, "Wrong login information.")
		return
	}

	let jwtSecretKey = process.env.JWT_SECRET_KEY
	let data = {
		time: Date(),
		user_id: user_id,
	}

	const token = sign(data, jwtSecretKey, {expiresIn: '10h'});

	res.status(200).send({
		"message": "Logged in 👍",
		"token": token
	})
})

app.post("/api/books", async (req, res) => {
	const { title, author, description, year } = req.body
	const token = req.headers.authorization

	if (await isTokenAdmin(token)) {
		sendError(res, 405, "You are not an administrator.")
		return
	}

	if (!title || !author || !description) {
		sendError(res, 400, "Missing name, author and/or description field.")
		return
	}

	await addNewBook(title, author, description, year, "")
		.then(newBook => res.status(201).send({
			"message": "New book created",
			"book": newBook
		}))
		.catch(error => sendError(res, 404, error))
	
})

app.post("/api/books/:id/favorite", (req, res) => {
	// TODO: Auth user
	const { id } = req.params
	const { user_id } = req.body

	if (!id) {
		sendError(res, 400, "Missing book id.")
		return
	}

	if (!user_id) {
		sendError(res, 400, "You must be logged in.")
		return
	}
	
	let book = getBookByID(id)
	if (!book) {
		sendError(res, 404, "Book not found")
		return
	}
	
	let user = getUserByID(user_id)
	if (!user) {
		sendError(res, 404, "User not found")
		return
	}
	
	let infav = isBookInUsersFavorite(user_id, id);
	if (infav == true) {
		sendError(res, 400, "Book is already in users favorite.")
		return
	}

	addBookToUsersFavorite(user_id, id)

	res.status(200).send({
		"message": "Book has been favorited.",
		"book": book,
		"usersFavorite": user.favorites
	})
})

// DELETE
app.delete("/api/users/:id", async (req, res) => {
	const { id } = req.params
	const token = req.headers.authorization

	// TODO: Let the user kms
	if (!await isTokenAdmin(token)) {
		sendError(res, 403, "You must be an administator to delete this user.")
		return
	}

	let { error } = await deleteUser(id);
	if (error) {
		sendError(res, 400, error)
		return
	}

	res.status(200).send({
		"message": "User deleted"
	})
})

app.delete("/api/books/:id", async (req, res) => {
	const { id } = req.params
	const token = req.headers.authorization

	if (!await isTokenAdmin(token)) {
		sendError(res, 403, "You must be an administator to delete this book.")
		return
	}

	await deleteBook(id)
	.then(() => {
		res.status(200).send({
			"message": "Book deleted"
		})
	}).catch((error) => {
		sendError(res, 400, error)
	});

})

app.delete("/api/books/:id/favorite", (req, res) => {
	// TODO: Auth user
	const { id } = req.params
	const { user_id } = req.body

	if (!id) {
		sendError(res, 400, "Missing book id.")
		return
	}
	
	if (!user_id) {
		sendError(res, 400, "You must be logged in.")
		return
	}
	
	let book = getBookByID(id)
	if (!book) {
		sendError(res, 404, "Book not found")
		return
	}
	
	let user = getUserByID(user_id)
	if (!user) {
		sendError(res, 404, "User not found")
		return
	}
	
	let infav = isBookInUsersFavorite(user_id, id);
	if (infav == false) {
		sendError(res, 400, "Book is not in users favorite")
		return
	}

	removeBookFromUsersFavorite(user_id, id)

	res.status(200).send({
		"message": "Book has been unfavorited.",
		"book": book,
		"usersFavorite": user.favorites
	})


})

// Functions
function isTokenValid(token) {
	let jwtSecretKey = process.env.JWT_SECRET_KEY;

	try {
		verify(token, jwtSecretKey)
	} catch (error) {
		return false
	}

	return true
}

async function isTokenAdmin(token) {
	if (!isTokenValid(token)) return false

	let jwtSecretKey = process.env.JWT_SECRET_KEY;

	try {
		var tk = verify(token, jwtSecretKey)
	} catch (error) {
		return false
	}

	console.log(tk)
	let user = await getUserById(tk.user_id)
	if (!user) return false

	return Boolean(user.role)
}

function sendError(res, statuscode, error) {
	res.status(statuscode).send({
		"message": "There has been an error: " + error
	})
}
