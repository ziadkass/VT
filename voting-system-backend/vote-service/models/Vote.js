const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    election_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    candidate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    vote_timestamp: {
        type: Date,
        default: Date.now
    }
});

VoteSchema.index({ election_id: 1, user_id: 1 }, { unique: true }); // Ensure unique votes per user per election

module.exports = mongoose.model('Vote', VoteSchema);
