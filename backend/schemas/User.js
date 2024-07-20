const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    uuid: { type: String, default: uuidv4, unique: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String },
    dueTime: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    todos: [todoSchema] 
});

module.exports = mongoose.model('User', userSchema);
