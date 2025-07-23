const { app } = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User Controller', () => {
  let adminToken, workerToken, adminId, workerId;

  beforeAll(async () => {
    // Clear existing data
    await User.deleteMany({});

    // Create test admin
    const admin = await User.create({
      username: 'testadmin',
      password: await bcrypt.hash('adminpass', 10),
      role: 'admin'
    });

    // Create test worker
    const worker = await User.create({
      username: 'testworker',
      password: await bcrypt.hash('workerpass', 10),
      role: 'worker',
      admin: admin._id
    });

    adminId = admin._id;
    workerId = worker._id;

    // Generate tokens
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET);
    workerToken = jwt.sign({ id: workerId, role: 'worker' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /api/users/register', () => {
    it('should register a new admin user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newadmin',
          password: 'admin123',
          role: 'admin'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.role).toBe('admin');
    });

    it('should reject duplicate usernames', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testadmin', // Already exists
          password: 'password',
          role: 'admin'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/already taken/i);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testadmin',
          password: 'adminpass'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('testadmin');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe('GET /api/users/my-workers', () => {
    it('should return workers for admin', async () => {
      const res = await request(app)
        .get('/api/users/my-workers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0].username).toBe('testworker');
    });

    it('should reject for non-admin users', async () => {
      const res = await request(app)
        .get('/api/users/my-workers')
        .set('Authorization', `Bearer ${workerToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('POST /api/users/create-worker', () => {
    it('should create new worker for admin', async () => {
      const res = await request(app)
        .post('/api/users/create-worker')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newworker',
          password: 'worker123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('Worker created');
      expect(res.body.worker.username).toBe('newworker');
    });

    it('should reject duplicate worker usernames', async () => {
      const res = await request(app)
        .post('/api/users/create-worker')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testworker', // Already exists
          password: 'worker123'
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should reject for non-admin users', async () => {
      const res = await request(app)
        .post('/api/users/create-worker')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          username: 'newworker2',
          password: 'worker123'
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete worker for admin', async () => {
      // Create temporary worker to delete
      const tempWorker = await User.create({
        username: 'tempworker',
        password: 'temp123',
        role: 'worker',
        admin: adminId
      });

      const res = await request(app)
        .delete(`/api/users/${tempWorker._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Worker deleted successfully');
    });

    it('should reject deleting non-existent worker', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
    });

    it('should reject for non-admin users', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminId}`) // Try to delete admin (should fail)
        .set('Authorization', `Bearer ${workerToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});