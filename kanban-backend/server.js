const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
// Load environment variables
dotenv.config();
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS configuration

// origin: ['http://localhost:3000', 'http://127.0.0.1:56410'],
// methods: 'GET,POST,PUT,DELETE',
// credentials: true,
app.use(cors());

// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Task routes
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

// Default test route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0',  () => console.log(`🚀 Server running on port ${PORT}`));
