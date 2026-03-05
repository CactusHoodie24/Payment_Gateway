require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Import MongoDB connection
const connectDB = require('./db');

// Routes
const authRoutes       = require('./routes/authRoutes');
const campaignRoutes   = require('./routes/campaignRoutes');
const categoryRoutes   = require('./routes/categoryRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const paymentRoutes    = require('./routes/paymentRoutes');
const validationRoutes = require("./routes/validationRoutes");
const merchantsRoute = require('./routes/merchantsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://fundmemalawi.com",
  "https://admin.fundmemalawi.com",
  "http://192.168.10.208:3000"
];

// ── Middleware ───────────────────────────────────────────────
app.use(cors()); // allows all origins by default

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ───────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/campaign-categories', categoryRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/validator", validationRoutes);
app.use('/api/merchants', merchantsRoute);

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
  await connectDB(); // Connect to MongoDB first
  app.listen(PORT, () => {
    console.log(`🚀 FundMe Malawi API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

module.exports = app;