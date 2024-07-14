const express = require('express');
const mongoose = require('mongoose');
const User = require('./schemas/User');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const saltRounds = 10;

const app = express();
const port = 3000;
app.use(express.json());

const whitelist = ['http://localhost:5173'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    key: "userId",
    secret: "thisismysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost/todolist',
        ttl: 24 * 60 * 60 
    }),
    cookie: {
        expires: 60 * 60 * 24 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
}));

mongoose.connect('mongodb://localhost/todolist');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send('You must be logged in to perform this action');
    }
}

app.get('/login', async (req, res) => {
    if (req.session.user) {
        res.status(200).send({ loggedIn: true, user: req.session.user });
    } else {
        res.status(200).send({ loggedIn: false, user: req.session.user });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username: username });
        if (!userExists) {
            res.status(404).json({ message: "User not found" });
        } else {
            bcrypt.compare(password, userExists.password, (error, result) => {
                if (result) {
                    req.session.user = userExists;
                    res.status(200).json({ message: "Login Successful" });
                } else {
                    res.status(400).json({ message: "Incorrect Password" });
                }
            });
        }
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error}` });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username: username });
        if (userExists) {
            return res.status(400).json({ message: "User exists" });
        }

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                return res.status(500).json({ message: "Error hashing password" });
            }

            const newUser = new User({ username: username, password: hash });
            await newUser.save();
            res.status(200).json({ message: `User registered with username of ${username}` });
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error(error);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error logging out' });
        } else {
            res.clearCookie('userId');
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

app.delete('/deleteUser', isAuthenticated, async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: "Username not provided" });
    }

    try {
        console.log('Received request to delete user');
        console.log('Username to delete:', username);

        const trimmedUsername = username.trim();
        const result = await User.deleteOne({ username: trimmedUsername });

        console.log('Delete result:', result);

        if (result.deletedCount === 0) {
            console.error("User not found");
            return res.status(404).send(`No user found with username: ${trimmedUsername}`);
        } else if (result.deletedCount === 1) {
            return res.status(200).json({ message: `Successfully deleted user with username: ${trimmedUsername}` });
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).send('Error deleting user');
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
