const express = require('express');
const { submitVote, getVotesByElection, getVotesByUser } = require('../controllers/voteController');
const router = express.Router();

/**
 * @swagger
 * /api/votes/{electionId}:
 *   post:
 *     summary: Submit a vote
 *     tags: [Votes]
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
 *               userId:
 *                 type: string
 *               candidateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vote submitted successfully
 */
router.post('/:electionId', submitVote);

/**
 * @swagger
 * /api/votes/election/{electionId}:
 *   get:
 *     summary: Get votes by election
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     responses:
 *       200:
 *         description: List of votes for the election
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   candidateId:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/election/:electionId', getVotesByElection);

/**
 * @swagger
 * /api/votes/user/{userId}:
 *   get:
 *     summary: Get votes by user
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of votes by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   electionId:
 *                     type: string
 *                   candidateId:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/user/:userId', getVotesByUser);

module.exports = router;
