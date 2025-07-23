const request = require('supertest');
const { app } = require('../server'); 
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

describe('Task Controller', () => {
  let adminToken;
  let workerToken;
  let adminId;
  let workerId;
  let taskId;

  beforeAll(async () => {
    // Setup test users
    const admin = await User.create({
      username: 'testadmin',
      password: 'password',
      role: 'admin'
    });

    const worker = await User.create({
      username: 'testworker',
      password: 'password',
      role: 'worker',
      admin: admin._id
    });

    adminId = admin._id;
    workerId = worker._id;

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminId, role: 'admin' },
      process.env.JWT_SECRET
    );

    workerToken = jwt.sign(
      { id: workerId, role: 'worker' },
      process.env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a task if admin', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test task',
          assignedTo: workerId
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test task');
      taskId = res.body._id;
    });

    it('should reject if not admin', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          title: 'Test task',
          assignedTo: workerId
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get worker tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${workerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('GET /api/tasks/assigned', () => {
    it('should get all tasks for admin', async () => {
      const res = await request(app)
        .get('/api/tasks/assigned')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ status: 'in progress' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.task.status).toBe('in progress');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task if admin', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Task deleted successfully');
    });
  });
});