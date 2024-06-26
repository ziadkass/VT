const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const voteRoutes = require('./routes/voteRoutes');
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
      title: 'Vote API',
      version: '1.0.0',
      description: 'API documentation for the vote service'
    },
    servers: [
      {
        url: 'http://localhost:5006'
      }
    ]
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/votes', voteRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Vote service running on port ${PORT}`));
