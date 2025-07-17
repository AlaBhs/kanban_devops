const Task = require('../models/Task');
const User = require('../models/User');

// 🔧 Admin: Create a task for their worker
const createTask = async (req, res) => {
  const { title, assignedTo } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create tasks' });
  }

  // Check that the worker belongs to the admin
  const worker = await User.findOne({ _id: assignedTo, role: 'worker', admin: req.user.id });
  if (!worker) {
    return res.status(404).json({ message: 'Worker not found or not under your account' });
  }

  const task = await Task.create({ title, assignedTo: worker._id });
  res.status(201).json(task);
};

// 👨‍🔧 Worker: Get own tasks
const getMyTasks = async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Only workers can view their tasks' });
  }

  const tasks = await Task.find({ assignedTo: req.user.id });
  res.json(tasks);
};

// 🔧 Admin: Get all tasks assigned to their workers
const getAllTasks = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can view all tasks' });
  }

  // Find all workers under this admin
  const workers = await User.find({ admin: req.user.id }, '_id');
  const workerIds = workers.map(w => w._id);

  const tasks = await Task.find({ assignedTo: { $in: workerIds } }).populate('assignedTo', 'username');
  res.json(tasks);
};

// 👨‍🔧 Worker: Update status of a task assigned to them
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Only workers can update tasks' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Ensure task belongs to the worker
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not your task' });
  }

  task.status = status;
  await task.save();
  res.json({ message: 'Task updated', task });
};

const deleteTask =  async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete tasks' });
  }

  const task = await require('../models/Task').findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if the task is assigned to one of this admin's workers
  const worker = await require('../models/User').findOne({ _id: task.assignedTo, admin: req.user.id });
  if (!worker) {
    return res.status(403).json({ message: 'You cannot delete tasks not assigned to your workers' });
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted successfully' });
}

module.exports = {
  createTask,
  getMyTasks,
  updateTaskStatus,
  getAllTasks,
  deleteTask,
};
