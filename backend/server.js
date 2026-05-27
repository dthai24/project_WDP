const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const courseRoutes  = require('./routes/courseRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ---- Middlewares ----
app.use(cors());
app.use(express.json());

// ---- Database ----
connectDB();

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// ---- Health-check ----
app.get('/api/ping', (_req, res) => res.json({ status: 'ok', message: 'S.T.A.R Backend is running' }));

// ---- Start ----
app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});