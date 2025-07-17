const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createTask,
  getMyTasks,
  updateTaskStatus,
  getAllTasks,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.post('/', protect, createTask);              // Admin
router.get('/', protect, getMyTasks);               // Worker
router.put('/:id', protect, updateTaskStatus);      // Worker
router.get('/assigned', protect, getAllTasks);      // Admin
router.delete('/:id', protect, deleteTask );         // Admin

module.exports = router;
