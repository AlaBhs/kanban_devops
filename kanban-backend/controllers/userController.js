const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const register = async (req, res) => {
  const { username, password, role } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);

  const newUserData = {
    username,
    password: hashed,
    role: "admin"
  };

  // If admin is creating a worker, attach admin ID
  if (role === 'worker') {
      return res.status(403).json({ message: 'Only admins can create workers' });
  }

  const user = await User.create(newUserData);
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.status(201).json({ token, role: user.role });
};


const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token, user: user });
};

const getMyWorkers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can see their workers' });
  }

  const workers = await User.find({ role: 'worker', admin: req.user.id }, '_id username');
  res.json(workers);
}

const createWorker = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can create workers' });

  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed, role: 'worker', admin: req.user.id });

  res.status(201).json({ message: 'Worker created', worker: { id: user._id, username: user.username } });
}

const deleteWorker = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete workers' });
  }

  const worker = await User.findOne({ _id: req.params.id, role: 'worker', admin: req.user.id });
  if (!worker) {
    return res.status(404).json({ message: 'Worker not found or not under your admin' });
  }

  // Optionally: delete all tasks assigned to the worker
  await require('../models/Task').deleteMany({ assignedTo: worker._id });

  await worker.deleteOne();
  res.json({ message: 'Worker deleted successfully' });
}

module.exports = { register, login, getMyWorkers, createWorker,deleteWorker };
