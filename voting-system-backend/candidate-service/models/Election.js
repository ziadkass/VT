const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
    election_name: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    image_url: {
        type: String, // You can store the URL of the image
        required: false
    }
});

module.exports = mongoose.model('Election', ElectionSchema);
