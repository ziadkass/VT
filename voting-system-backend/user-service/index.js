const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { authMiddleware, adminMiddleware } = require('./middlewares/authMiddleware');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API documentation for the user service'
    },
    servers: [
      {
        url: 'http://localhost:5002'
      }
    ]
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/admin/users', authMiddleware, adminMiddleware, userRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
