require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const axios = require("axios");

// Import MongoDB connection
const connectDB = require('./db');

// Routes
const authRoutes       = require('./routes/authRoutes');
const campaignRoutes   = require('./routes/campaignRoutes');
const categoryRoutes   = require('./routes/categoryRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const paymentRoutes    = require('./routes/paymentRoutes');
const validationRoutes = require("./routes/validationRoutes");
const merchantsRoute   = require('./routes/merchantsRoutes');
const apiLimiter       = require('./middleware/rateLimiter');
const validateBody     = require('./middleware/userValidation');
const { createProxyMiddleware } = require('http-proxy-middleware');
const validateUser = require("./middleware/validateUser");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://fundmemalawi.com",
  "https://admin.fundmemalawi.com",
  "http://192.168.10.208:3000"
];
const BACKEND_URL = 'http://localhost:4000';

// ── Middleware ───────────────────────────────────────────────
app.use(cors());

// ✅ Parse body BEFORE validateUser so req.body is populated
app.use('/api', express.json());
app.use('/api', express.urlencoded({ extended: true }));


// Body parsing for non-proxied routes below
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/hello', (req, res) => res.status(200).json({ message: 'Welcome to my Backend' }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/campaign-categories', categoryRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/validator", validationRoutes);
app.use('/api/merchants', merchantsRoute);

app.post("/api/users", apiLimiter, validateUser, async (req, res) => {
  try {

    console.log("Proxy received request");
    console.log(req.body);

    const response = await axios.post(
      "http://localhost:4000/users",
      req.body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Response from backend:", response.data);

    res.status(response.status).json(response.data);

  } catch (error) {

    console.error("Proxy error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ message: "Proxy server error" });
  }
});

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ── Global error handler ───────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 FundMe Malawi API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

module.exports = app;