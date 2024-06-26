const Vote = require('../models/Vote');
const Election = require('../models/Election'); // Import the Election model
const Candidate = require('../models/Candidate');
const User = require('../models/User'); 
const bcrypt = require('bcrypt'); // Add this line to import bcrypt





// Submit a vote
async function submitVote(req, res) {
    console.log("submitVote called");
    try {
        const { electionId } = req.params;
        const { userId, candidateId, password } = req.body;

        // Verify the user's password
        const user = await User.findById(userId);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).send('Invalid password');
        }

        // Check if the user has already voted in this election
        const existingVote = await Vote.findOne({ election_id: electionId, user_id: userId });
        if (existingVote) {
            return res.status(400).send('You have already voted in this election');
        }

        const vote = new Vote({ election_id: electionId, user_id: userId, candidate_id: candidateId });
        await vote.save();
        res.status(201).send(vote);
    } catch (err) {
        console.error('Vote submission error:', err.message);
        res.status(500).send('Internal Server Error');
    }
}



// Get votes by election
async function getVotesByElection(req, res) {
    try {
        const { electionId } = req.params;
        const votes = await Vote.find({ election_id: electionId }).populate('user_id candidate_id');
        res.status(200).send(votes);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Get votes by user
async function getVotesByUser(req, res) {
    try {
        const { userId } = req.params;
        const votes = await Vote.find({ user_id: userId }).populate('election_id candidate_id');
        res.status(200).send(votes);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

module.exports = {
    submitVote,
    getVotesByElection,
    getVotesByUser
};
