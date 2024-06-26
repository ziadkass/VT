const express = require('express');
const { createElection, updateElection, deleteElection, importElections, getAllElections, getCurrentElections, getElectionById  } = require('../controllers/electionController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/elections:
 *   post:
 *     summary: Create a new election
 *     tags: [Elections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Election created successfully
 */
router.post('/', authMiddleware, adminMiddleware, createElection);

/**
 * @swagger
 * /api/elections/{electionId}:
 *   put:
 *     summary: Update an election
 *     tags: [Elections]
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
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Election updated successfully
 */
router.put('/:electionId', authMiddleware, adminMiddleware, updateElection);

/**
 * @swagger
 * /api/elections/{electionId}:
 *   delete:
 *     summary: Delete an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     responses:
 *       200:
 *         description: Election deleted successfully
 */
router.delete('/:electionId', authMiddleware, adminMiddleware, deleteElection);

/**
 * @swagger
 * /api/elections/import:
 *   post:
 *     summary: Import elections
 *     tags: [Elections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *     responses:
 *       200:
 *         description: Elections imported successfully
 */
router.post('/import', authMiddleware, adminMiddleware, importElections);

/**
 * @swagger
 * /api/elections/all:
 *   get:
 *     summary: Get all elections
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: List of all elections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 */
router.get('/all', getAllElections);
router.get('/current', authMiddleware, getCurrentElections);
router.get('/:electionId', authMiddleware, getElectionById); // Nouvelle route pour obtenir une élection par ID
// Get election by ID
router.get('/:id', async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        res.json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
