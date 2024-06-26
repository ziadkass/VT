const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { ObjectId } = mongoose.Types;

// Add a candidate to an election
async function addCandidate(req, res) {
    try {
        const { electionId } = req.params;
        const { candidate_name, party, image_url } = req.body;

        // Validate and cast electionId to ObjectId
        if (!ObjectId.isValid(electionId)) {
            return res.status(400).send('Invalid election ID');
        }
        const objectId = new ObjectId(electionId);

        const candidate = new Candidate({ election_id: objectId, candidate_name, party, image_url });
        await candidate.save();
        res.status(201).send(candidate);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Remove a candidate from an election
async function removeCandidate(req, res) {
    try {
        const { electionId, candidateId } = req.params;

        // Validate and cast electionId and candidateId to ObjectId
        if (!ObjectId.isValid(electionId) || !ObjectId.isValid(candidateId)) {
            return res.status(400).send('Invalid election ID or candidate ID');
        }
        const electionObjectId = new ObjectId(electionId);
        const candidateObjectId = new ObjectId(candidateId);

        const candidate = await Candidate.findOneAndDelete({ _id: candidateObjectId, election_id: electionObjectId });
        if (!candidate) {
            return res.status(404).send('Candidate not found');
        }
        res.status(200).send('Candidate removed');
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Update candidate details
async function updateCandidate(req, res) {
    try {
        const { electionId, candidateId } = req.params;
        const updateData = req.body;

        // Validate and cast electionId and candidateId to ObjectId
        if (!ObjectId.isValid(electionId) || !ObjectId.isValid(candidateId)) {
            return res.status(400).send('Invalid election ID or candidate ID');
        }
        const electionObjectId = new ObjectId(electionId);
        const candidateObjectId = new ObjectId(candidateId);

        const candidate = await Candidate.findOneAndUpdate(
            { _id: candidateObjectId, election_id: electionObjectId },
            updateData,
            { new: true }
        );
        if (!candidate) {
            return res.status(404).send('Candidate not found');
        }
        res.status(200).send(candidate);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Get total candidates by election
const getTotalCandidatesByElection = async (req, res) => {
    try {
        const results = await Candidate.aggregate([
            {
                $group: {
                    _id: "$election_id",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "elections",
                    localField: "_id",
                    foreignField: "_id",
                    as: "election"
                }
            },
            {
                $unwind: "$election"
            },
            {
                $project: {
                    _id: 0,
                    election_name: "$election.election_name",
                    count: 1
                }
            }
        ]);

        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    addCandidate,
    removeCandidate,
    updateCandidate,
    getTotalCandidatesByElection
};
