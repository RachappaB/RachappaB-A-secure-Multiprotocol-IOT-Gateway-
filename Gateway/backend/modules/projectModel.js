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
    apiKey: {
        type: String,
        required: true,
        trim: true
    },
    mode: {
        type: String,
        enum: ['Hard', 'Easy'],
        default: 'Hard'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Assuming you have a Customer model
        required: true
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
    },
    lastPushed: {
        type: Date,
        default: Date.now // Initialize to the creation time
    }
});

module.exports = mongoose.model('Project', projectSchema);
