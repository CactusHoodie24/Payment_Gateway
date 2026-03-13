require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const axios = require("axios");
const cookieParser = require('cookie-parser');

// Import MongoDB connection
const { connectDB } = require('./db');

// Routes
const authRoutes             = require('./routes/authRoutes');
const validationRoutes       = require("./routes/validationRoutes");
const merchantsRoute         = require('./routes/merchantsRoutes');
const apiLimiter             = require('./middleware/rateLimiter');
const validateUser           = require("./middleware/validateUser");
const organizationRoutes     = require('./routes/organizationRoutes');
const chargeProfileRoutes    = require('./routes/chargeProfileRoutes');
const chargeItemRoutes       = require('./routes/chargeItemRoutes');
const transactionTypeRoutes  = require('./routes/transactionTypeRoutes');
const organizationTypeRoutes = require('./routes/organizationTypeRoutes');
const transactionRoutes      = require('./routes/transactionRoutes');
const accountRoutes          = require('./routes/accountRoutes');
const organizationApiKeyRoutes = require('./routes/organizationApiKeyRoutes');
const userRoutes             = require('./routes/userRoutes');
const otpRoutes              = require('./routes/otpRoutes');
const accountEntryRoutes     = require('./routes/accountEntryRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const webhookEventRoutes = require('./routes/webhookEventRoutes');
const auditLogRoutes     = require('./routes/auditLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');



const app  = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.0.174:3000',
  'http://192.168.10.208:3000',
  'http://192.168.10.219:3000',
  /\.ngrok-free\.app$/,   // ← allow all ngrok URLs
  /\.ngrok\.io$/
];


app.use(cors({
 origin: true,
  credentials: true
}));

app.use(cookieParser());

app.use('/api', express.json());
app.use('/api', express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/hello', (req, res) => res.status(200).json({ message: 'Welcome to my Backend' }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use("/api/validator", validationRoutes);
app.use('/api/merchants', merchantsRoute);
app.use('/api/organizations', organizationRoutes);
app.use('/api/charge-profiles', chargeProfileRoutes);
app.use('/api/charge-items', chargeItemRoutes);
app.use('/api/transaction-types', transactionTypeRoutes);
app.use('/api/organization-types', organizationTypeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/api-keys', organizationApiKeyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otps', otpRoutes);
app.use('/api/account-entries', accountEntryRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/webhook-events', webhookEventRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);


// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Malipo API running on ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

module.exports = app;