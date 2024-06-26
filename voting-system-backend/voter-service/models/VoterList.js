const mongoose = require('mongoose');

const VoterListSchema = new mongoose.Schema({
    election_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    unique: true
});

module.exports = mongoose.model('VoterList', VoterListSchema);
