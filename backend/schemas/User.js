const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    todos: [
        {
            title: { type: String, required: true },
            completed: { type: Boolean, default: false },
            dueDate: { type: String },
            dueTime: { type: String },
            priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
        }
    ]
});

module.exports = mongoose.model('User', todoSchema);
