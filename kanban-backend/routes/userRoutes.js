const express = require("express");
const {
  register,
  login,
  getMyWorkers,
  createWorker,
  deleteWorker,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/my-workers", protect, getMyWorkers);
router.post("/create-worker", protect, createWorker);
router.delete('/:id', protect,deleteWorker );

module.exports = router;
