const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const client = require('prom-client');

// ======================
// PROMETHEUS CONFIGURATION
// ======================
const register = new client.Registry();

// Enable default Node.js metrics
client.collectDefaultMetrics({
  register,
  timeout: 5000,
  prefix: 'nodejs_'
});

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [50, 100, 200, 300, 400, 500, 750, 1000, 1500, 2000]
});
register.registerMetric(httpRequestDurationMicroseconds);

const activeRequestsGauge = new client.Gauge({
  name: 'nodejs_active_requests',
  help: 'Number of active requests'
});
register.registerMetric(activeRequestsGauge);

// ======================
// EXPRESS APP SETUP
// ======================
// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Request monitoring middleware
app.use((req, res, next) => {
  activeRequestsGauge.inc();
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
    activeRequestsGauge.dec();
  });
  next();
});

// ======================
// ROUTES
// ======================
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// Test route
app.get("/", (req, res) => res.send("✅ API is running..."));

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).end();
  }
});

// ======================
// SERVER INITIALIZATION
// ======================
let server;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  });
}

module.exports = { app, server };