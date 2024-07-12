const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./schemas/User');
const cors = require('cors');

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
    }
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/todolist', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username: username });
        if (!userExists) {
            res.status(404).json({ message: "User not found" });
        } else if (userExists.password !== password) {
            res.status(400).json({ message: "Incorrect Password" });
        } else {
            res.status(200).json({ message: "Login Successful" });
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
            res.status(400).json({ message: "User exists" });
            console.log("User exists");
        } else {
            const newUser = new User({ username: username, password: password });
            await newUser.save();
            res.status(200).json({ message: `User registered with username of ${username}` });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
