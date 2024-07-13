const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./schemas/User');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10

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

mongoose.connect('mongodb://localhost/todolist');



app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username: username });
        if (!userExists) {
            res.status(404).json({ message: "User not found" });
        } else if (bcrypt.compare(password, userExists.password, (error, result) => {
            if(result){
                res.status(200).json({ message: "Login Successful" });
            }
            else{
                res.status(400).json({ message: "Incorrect Password" });
            }
        })) {
        } else {
            
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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
