const VoterList = require('../models/VoterList');

// Add a voter to an election
async function addVoterToElection(req, res) {
    try {
        const { electionId } = req.params;
        const { userId } = req.body;
        const voter = new VoterList({ election_id: electionId, user_id: userId });
        await voter.save();
        res.status(201).send(voter);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Remove a voter from an election
async function removeVoterFromElection(req, res) {
    try {
        const { electionId, userId } = req.params;
        const voter = await VoterList.findOneAndDelete({ election_id: electionId, user_id: userId });
        if (!voter) {
            return res.status(404).send('Voter not found');
        }
        res.status(200).send('Voter removed');
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Get voters by election
async function getVotersByElection(req, res) {
    try {
        const { electionId } = req.params;
        const voters = await VoterList.find({ election_id: electionId }).populate('user_id');
        res.status(200).send(voters);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

module.exports = {
    addVoterToElection,
    removeVoterFromElection,
    getVotersByElection
};
