const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes    = require('./routes/authRoutes');
<<<<<<< HEAD
const courseRoutes = require('./routes/courseRoutes');
=======
const userRoutes    = require('./routes/userRoutes');
const courseRoutes  = require('./routes/courseRoutes');
>>>>>>> origin/Nguyen_Tan_Dung_HE194923

const app  = express();
const PORT = process.env.PORT || 5000;

// ---- Middlewares ----
app.use(cors());
app.use(express.json());

// ---- Database ----
connectDB();

// ---- Routes ----
app.use('/api/auth', authRoutes);
<<<<<<< HEAD
=======
app.use('/api/users', userRoutes);
>>>>>>> origin/Nguyen_Tan_Dung_HE194923
app.use('/api/courses', courseRoutes);

// ---- Health-check ----
app.get('/api/ping', (_req, res) => res.json({ status: 'ok', message: 'S.T.A.R Backend is running 🚀' }));

// ---- Start ----
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
});