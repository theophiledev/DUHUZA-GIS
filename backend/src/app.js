require('dotenv').config();
require('express-async-errors'); // patches Express so thrown errors in async
                                  // controllers above reach errorHandler
                                  // without manual try/catch in every route
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
