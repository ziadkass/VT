const express = require('express');
const { addCandidate, removeCandidate, updateCandidate , getTotalCandidatesByElection } = require('../controllers/candidateController');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const Candidate = require('../models/Candidate');

/**
 * @swagger
 * /api/candidates/{electionId}:
 *   post:
 *     summary: Add a new candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate_name:
 *                 type: string
 *               party:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate added successfully
 */
router.post('/:electionId', addCandidate);

/**
 * @swagger
 * /api/candidates/{electionId}/{candidateId}:
 *   delete:
 *     summary: Remove a candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     responses:
 *       200:
 *         description: Candidate removed successfully
 */
router.delete('/:electionId/:candidateId', removeCandidate);

/**
 * @swagger
 * /api/candidates/{electionId}/{candidateId}:
 *   put:
 *     summary: Update a candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate_name:
 *                 type: string
 *               party:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 */
router.put('/:electionId/:candidateId', updateCandidate);

/**
 * @swagger
 * /api/candidates/{electionId}:
 *   get:
 *     summary: Get candidates by election ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     responses:
 *       200:
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   candidate_name:
 *                     type: string
 *                   party:
 *                     type: string
 */
router.get('/:electionId', async (req, res) => {
    try {
        const candidates = await Candidate.find({ election_id: req.params.electionId });
        res.json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});



router.get('/stats/total-by-party/:electionId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const electionId = req.params.electionId;
        const data = await Candidate.aggregate([
            { $match: { election_id: electionId } },
            {
                $group: {
                    _id: "$party",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/stats/evolution', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const data = await Candidate.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.get('/stats/total-by-election', authMiddleware, adminMiddleware, getTotalCandidatesByElection);



module.exports = router;
