import express from 'express'
import prisma from './utils/db.js'
import cookieParser from 'cookie-parser';

const app = express()
const PORT = 3000

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// authentication middleware
const AuthenticatUser = (req, res, next) => {
    if (!req.cookies.user) {
        return res.status(401).json({ error: "Unauthorized" }).redirect('/login');
    }
    next();
}

// Sample route
app.get('/', (req, res) => {
    console.log(req.cookies);
    
    req.cookies.user ? res.send(`Hello ${req.cookies.user.username}, <a href='/logout'>Logout </a>`) : res.send('Plz <a href="/login">Login</a> First');
});

app.get('/login', async (req, res) => {
    console.log("Login route hit");

    try {
        const { name, username, password } = req.query;

        if (!name || !username || !password) {
            return res.status(400).json({ error: "name, username and password required" });
        }

        const user = await prisma.user.create({
            data: { name, username, password },
        });
        res.cookie('user', { name, username, id: user.id }, { maxAge: 900000, httpOnly: true });
        // res.redirect('/');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
    res.send('Logged out');
});

app.get('/create/post', AuthenticatUser, async (req, res) => {
    const { title, content } = req.query;

    if (!title || !content) {
        return res.status(400).json({ error: "title and content required" });
    }

    const post = await prisma.post.create({
        data: {
            title, 
            content,
            user: { connect: { id: req.cookies.user.id } }
        },
    })
    res.json(post);

});

app.get('/user/:username', async (req, res) => {
    if (!req.params.username) {
        return res.status(400).json({ error: "username required" });
    }
    const users = await prisma.user.findUnique({
        where: { username: req.params.username },
        include: { posts: true },
    });
    if (!users) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(users);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});