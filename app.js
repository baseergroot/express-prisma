import express from 'express';
import db from './utils/db.js';
const app = express();
import cookieParser from 'cookie-parser';

// Middleware to check authentication
const AuthenticateUser = (req, res, next) => {
	const userCookie = req.cookies;
	// console.log("userCookie: ", userCookie);
	if (!userCookie) {
		res.redirect('http://localhost:8080/app.html');
	}

	const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userCookie.user.id);
	if (user) {
		console.log("User authenticated:", user);
		
	} else {
		console.log("User not authenticated");
		res.redirect('login');
	}
	next();
}

app.use(cookieParser());

// home route
app.get('/', AuthenticateUser,  (req, res) => {
	// const user = req.cookies.user
	const user = db.prepare(`SELECT u.id u.name u.username p.user_id p.title p.content FROM users as u JOIN posts AS p ON u.id = p.user_id `).get(req.cookies.user.username)
	// const posts = db.prepare(`SELECT * FROM posts WHERE user_id = ?`).all(req.cookies.user.id)
	console.log("user: ", user);
	res.json(user)
});

// signup api
app.get('/signup', (req, res) => {
	const { name, username, password } = req.query
	// console.log(name, username, password);
	if (name, username, password) {
		try {
			const insert = db.prepare(`INSERT INTO users(name, username, password) VALUES (?,?,?)`)
			insert.run(name, username, password)
			const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
			res.cookie('user', { name, username, id: user.id }, { maxAge: 900000, httpOnly: true });
			res.json({ message: "Login successful" });
		} catch (error) {
			if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				res.send("Username already exists. Please choose a different username.")
			} else {
				res.send("An error occurred while processing your request.")
			}
		}
		// res.send(`Hello, ${name}`)
	} else {
		res.send("Something went wrong")
	}
})

// create post api
app.get('/create/post', AuthenticateUser, (req, res) => {
	const { title, content } = req.query
	if (title, content) {
		db.prepare(`INSERT INTO POSTS (title,  content, user_id) VALUES (?, ?, ?)`).run(title, content, req.cookies.user.id)
		res.send("Post added")
	} else {
		console.log(" no field shoudnot be empty")
		res.send(" no field shoudnot be empty")
	}
})


// listening to server
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
