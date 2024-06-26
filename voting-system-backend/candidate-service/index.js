const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');
const { authMiddleware, adminMiddleware } = require('./middlewares/authMiddleware');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Candidate API',
      version: '1.0.0',
      description: 'API documentation for the candidate service'
    },
    servers: [
      {
        url: 'http://localhost:5004'
      }
    ]
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/candidates', candidateRoutes);
app.use('/api/admin/candidates', authMiddleware, adminMiddleware, candidateRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Candidate service running on port ${PORT}`));
