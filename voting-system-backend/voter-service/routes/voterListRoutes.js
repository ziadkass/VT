const express = require('express');
const { addVoterToElection, removeVoterFromElection, getVotersByElection } = require('../controllers/voterListController');
const router = express.Router();

router.post('/:electionId', addVoterToElection);
router.delete('/:electionId/:userId', removeVoterFromElection);
router.get('/:electionId', getVotersByElection);

module.exports = router;
