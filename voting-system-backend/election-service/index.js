const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const electionRoutes = require('./routes/electionRoutes');
const { authMiddleware, adminMiddleware } = require('./middlewares/authMiddleware');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
connectDB();

// Apply CORS middleware globally
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handling preflight requests
app.options('*', cors());

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Election API',
      version: '1.0.0',
      description: 'API documentation for the election service'
    },
    servers: [
      {
        url: 'http://localhost:5003'
      }
    ]
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Election routes
app.use('/api/elections', electionRoutes);
app.use('/api/admin/elections', authMiddleware, adminMiddleware, electionRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Election service running on port ${PORT}`));
