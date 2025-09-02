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

app.get('/signup', async (req, res) => {
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

app.get('/login', async (req, res) => {
    console.log("Login route hit");
    const { username, password } = req.query
    if (!username || !password) {
        res.status(400).send("username and password are required")
    }
    const user = await prisma.user.findUnique({
        where: { username, password }
    })
    if (!user) {
        res.send("username or password are inncorrect")
    }
    res.cookie('user', { name: user.name, username, id: user.id }, { maxAge: 900000, httpOnly: true })
    res.send("Logged in successfully")
}
)

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

app.get('/post/like/:postid', async (req, res) => {
    const postId = parseInt(req.params.postid);
    const userId = parseInt(req.cookies.user?.id);
    if (!postId || !userId) {
        return res.status(400).json({ error: "postid and userid required" });
    }
    const existing = await prisma.like.findUnique({
        where: { postId_userId: { postId, userId } } // requires @@unique([userId, postId]) in schema
    });
    if (existing) {
        // unlike
        const  like = await prisma.like.delete({
            where: { postId_userId: { postId, userId } }
        });
        return res.json({ message: "Like removed", like });
    }
    const like = await prisma.like.create({
        data: {
            post: { connect: { id: postId } },
            user: { connect: { id: userId } } // make sure Like model has userId relation
        }
    });
    const  post = await prisma.post.findUnique({
        where: { id: postId },
        include: { user: true, likes: true  }
    })
    res.json({ message: "Like added", post });
})


// get  user by username with posts
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
