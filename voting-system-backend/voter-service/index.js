const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const voterListRoutes = require('./routes/voterListRoutes');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

app.use('/api/voter-list', voterListRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Voter List service running on port ${PORT}`));
