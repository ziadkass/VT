const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    election_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidate_name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    image_url: {
        type: String, // Field to store the image URL
        required: false
    }
});

module.exports = mongoose.model('Candidate', candidateSchema);
