const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./schemas/User');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
// const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const {google} = require('googleapis');
const cookieSession = require('cookie-session');
const crypto = require('crypto');
const moment = require('moment-timezone');

const generateSecureKey = () => crypto.randomBytes(32).toString('hex');

const saltRounds = 10;

const app = express();
const port = 3000;

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.SECRET_ID, process.env.REDIRECT);


app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
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

function combineDueDateAndTime(dueDate, dueTime) {
    return moment(`${dueDate}T${dueTime}`).toISOString();
}

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send('You must be logged in to perform this action');
    }
}

app.get('/redirect', (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code is missing');
    }

    oauth2Client.getToken(code, (err, tokensResult) => {
        if (err) {
            console.error("Couldn't get token", err);
            return res.status(500).send(`Error retrieving tokens: ${err.message}`);
        }
        req.session.tokens = tokensResult; 
        oauth2Client.setCredentials(tokensResult);
        res.send('Successfully logged in');
    });
});

app.get('/auth/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/calendar',
    });
    res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        req.session.tokens = tokens;
        res.redirect('/'); 
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function createGoogleCalendarEvent(eventData) {
    try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Combine due date and time
        const startDateTimeUTC = combineDueDateAndTime(eventData.dueDate, eventData.dueTime);

        // Subtract 4 hours from UTC time
        const startDateTime = moment.utc(startDateTimeUTC).subtract(4, 'hours').format();
        const endDateTime = moment(startDateTime).add(eventData.eventLength, 'hours').format();

        const event = {
            summary: eventData.title,
            start: {
                dateTime: startDateTime,
                timeZone: 'UTC', // Still in UTC after subtraction
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'UTC', // Still in UTC after subtraction
            },
            description: "",
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
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
            res.clearCookie('userId'); // Clear the cookie if you set one
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

        const result = await User.deleteOne({ username: username });

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

app.post('/item', async (req, res) => {
    const { user, title, priority, dueDate, dueTime, hours, eventLength } = req.body;
    try {
        const existingUser = await User.findOne({ username: user });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newTodo = {
            uuid: uuidv4(),
            title,
            priority: priority || 'medium',
            dueDate,
            dueTime,
            hours,
            eventLength
        };

        existingUser.todos.push(newTodo);
        await existingUser.save();

        res.status(200).json({ message: 'Todo item added successfully', uuid: newTodo.uuid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete('/item', async (req, res) => {
    const { user, uuid } = req.body;
    try {
        const existingUser = await User.findOne({ username: user });
        if (!existingUser) {
            return res.status(404).send('User not found');
        }

        const todoIndex = existingUser.todos.findIndex(todo => todo.uuid === uuid);
        if (todoIndex === -1) {
            return res.status(404).send('Todo item not found');
        }

        existingUser.todos.splice(todoIndex, 1);
        await existingUser.save();

        res.status(200).send('Todo item deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.put('/item', async (req, res) => {
    const { uuid, user, newTitle, priority, dueDate, dueTime, completed, hours, eventLength } = req.body;
    try {
        const existingUser = await User.findOne({ username: user });
        if (!existingUser) {
            return res.status(404).send('User not found');
        }

        const todo = existingUser.todos.find(todo => todo.uuid === uuid);
        if (!todo) {
            return res.status(404).send('Todo item not found');
        }

        if (newTitle !== undefined && newTitle !== null) todo.title = newTitle;
        if (priority !== undefined && priority !== null) todo.priority = priority;
        if (dueDate !== undefined && dueDate !== null && dueDate !== '') todo.dueDate = dueDate;
        if (dueTime !== undefined && dueTime !== null && dueTime !== '') todo.dueTime = dueTime;
        if (completed !== undefined && completed !== null) todo.completed = completed;
        if (hours !== undefined && hours !== null && hours !== '') todo.hours = hours;
        if (eventLength !== undefined && eventLength !== null && eventLength !== '') todo.eventLength = eventLength;

        await existingUser.save();

        res.status(200).send('Todo item updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




app.get('/items', async (req, res) => {
    const { user } = req.query;
    try {
        const existingUser = await User.findOne({ username: user });
        if (!existingUser) {
            return res.status(404).send('User not found');
        }

        const groupedTodos = existingUser.todos.reduce((acc, todo) => {
            if (!acc[todo.priority]) {
                acc[todo.priority] = [];
            }
            acc[todo.priority].push(todo);
            return acc;
        }, {});

        const highCount = groupedTodos['high'] ? groupedTodos['high'].length : 0;
        const mediumCount = groupedTodos['medium'] ? groupedTodos['medium'].length : 0;
        const lowCount = groupedTodos['low'] ? groupedTodos['low'].length : 0;
        const lengths = [highCount, mediumCount, lowCount];
        const currentPriority = ["high", "medium", "low"];
        let itemList = [];

        lengths.forEach((length, counter) => {
            for (let i = 0; i < length; i++) {
                const dueDate = groupedTodos[currentPriority[counter]][i].dueDate;
                const dueTime = groupedTodos[currentPriority[counter]][i].dueTime;
                const completed = groupedTodos[currentPriority[counter]][i].completed;
                const hours = groupedTodos[currentPriority[counter]][i].hours;
                const dateParts = dueDate.split('-');
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);

                const timeParts = dueTime.split(':');
                const hour = parseInt(timeParts[0], 10);
                const minute = parseInt(timeParts[1], 10);

                const dateTime = moment({ year, month, day, hour, minute });

                const title = groupedTodos[currentPriority[counter]][i].title;
                const priority = currentPriority[counter];
                const uuid = groupedTodos[currentPriority[counter]][i].uuid;
                const eventLength = groupedTodos[currentPriority[counter]][i].eventLength

                itemList.push({
                    uuid,
                    priority,
                    title,
                    dateTime,
                    completed,
                    hours,
                    eventLength
                });
            }
        });

        itemList.sort((a, b) => {
            if (a.dateTime.isSame(b.dateTime, 'day')) {
                return a.dateTime.diff(b.dateTime, 'minute');
            } else {
                return a.dateTime.diff(b.dateTime, 'day');
            }
        });

        let sortedTodos = {
            high: [],
            medium: [],
            low: []
        };

        itemList.forEach(item => {
            sortedTodos[item.priority].push({
                uuid: item.uuid,
                title: item.title,
                priority: item.priority,
                dueDate: item.dateTime,
                completed: item.completed,
                hours: item.hours,
                eventLength: item.eventLength
            });
        });

        res.status(200).json(sortedTodos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/make-my-calendar', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(404).send('User not found in session');
        }

        const existingUser = await User.findOne({ username: user.username });
        if (!existingUser) {
            return res.status(404).send('User not found in database');
        }

        const allTodos = existingUser.todos;
        storedParsedTodos = parser_function(allTodos);
        const todoId = "f0975328-a518-4224-86b6-d8ca999c119c"
        const todoItem = allTodos.find(todo => todo.uuid === todoId);
        oauth2Client.setCredentials(req.session.tokens);

        const title = todoItem.title;
        const dueDate = todoItem.dueDate;
        const dueTime = todoItem.dueTime;
        const eventLength = todoItem.eventLength;

        const event = {
            title,
            dueDate,
            dueTime,
            eventLength            
        }

        const calendarEvent = await createGoogleCalendarEvent(event);
        console.log(calendarEvent)
        res.status(200).json({ message: 'Event created successfully', calendarEvent });

    } catch (error) {
        console.error('Error parsing todos:', error);
        res.status(500).send('Internal Server Error');
    }
});

function parser_function(todos) {
    console.log(todos);
}


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});