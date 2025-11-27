require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', rateLimit({ windowMs: 15*60*1000, max: 50 }), authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`API running at http://localhost:${process.env.PORT}`);
});

// ---------- 404 Handler (Route not found) ----------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  return res.status(err.status || 500).json({
    success: false,
    response: err.status || 500,
    messageType: err.status >= 500 ? "E" : "W",
    message: err.message || "Internal server error",
    details: err.details || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.originalUrl,
    status: err.status || 500,
    details: err.details || null
  });
});
