const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    mode: {
        type: String,
        enum: ['Hard', 'Easy'],
        default: 'Hard'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // assuming you have a Customer model
        required: true // fixed typo here
    },
    numOfColumns: {
        type: Number,
        default: 0
    },
    columnNames: {
        type: [String], // Array of strings for column names
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);
