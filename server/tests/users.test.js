const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// ─── Mongoose mock ───────────────────────────────────────────────────────────
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(undefined) };
});

// ─── Model mocks ─────────────────────────────────────────────────────────────
const mockUserData = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Bio text',
  skills: ['React', 'Node.js'],
};

jest.mock('../models/User', () => {
  const MockUser = jest.fn();
  MockUser.find = jest.fn();
  MockUser.findOne = jest.fn();
  MockUser.findById = jest.fn();
  MockUser.findByIdAndUpdate = jest.fn();
  return MockUser;
});

jest.mock('../models/Project', () => ({}));

const User = require('../models/User');

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/users', require('../routes/users'));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const makeToken = (userId = 'user123') =>
  jwt.sign({ userId }, process.env.JWT_SECRET);

const withSelect = (value) => ({ select: jest.fn().mockResolvedValue(value) });

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('User Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── GET /api/users ────────────────────────────────────────────────────────
  describe('GET /api/users', () => {
    it('returns list of all users', async () => {
      User.find.mockReturnValue(withSelect([mockUserData]));
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].email).toBe('test@example.com');
    });

    it('returns empty array when no users exist', async () => {
      User.find.mockReturnValue(withSelect([]));
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 500 when database throws', async () => {
      User.find.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB')) });
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(500);
    });
  });

  // ── GET /api/users/:id ────────────────────────────────────────────────────
  describe('GET /api/users/:id', () => {
    it('returns user by valid ID', async () => {
      User.findById.mockReturnValue(withSelect(mockUserData));
      const res = await request(app).get('/api/users/user123');
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Test User');
    });

    it('returns 404 when user not found', async () => {
      User.findById.mockReturnValue(withSelect(null));
      const res = await request(app).get('/api/users/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('returns 500 when database throws', async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB')) });
      const res = await request(app).get('/api/users/user123');
      expect(res.statusCode).toBe(500);
    });
  });

  // ── PUT /api/users/profile ────────────────────────────────────────────────
  describe('PUT /api/users/profile', () => {
    const token = () => makeToken();

    it('updates profile with valid data', async () => {
      const updated = { ...mockUserData, bio: 'New bio', skills: ['TypeScript'] };
      User.findOne.mockResolvedValue(mockUserData);
      User.findByIdAndUpdate.mockReturnValue(withSelect(updated));
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token()}`)
        .send({ name: 'Test User', bio: 'New bio', skills: ['TypeScript'] });
      expect(res.statusCode).toBe(200);
      expect(res.body.bio).toBe('New bio');
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Test User' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when name is empty', async () => {
      User.findOne.mockResolvedValue(mockUserData);
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token()}`)
        .send({ name: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'name')).toBe(true);
    });

    it('returns 400 when skills is not an array', async () => {
      User.findOne.mockResolvedValue(mockUserData);
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token()}`)
        .send({ name: 'Test User', skills: 'not-an-array' });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'skills')).toBe(true);
    });

    it('updates only provided optional fields', async () => {
      const updated = { ...mockUserData, githubUrl: 'https://github.com/test' };
      User.findOne.mockResolvedValue(mockUserData);
      User.findByIdAndUpdate.mockReturnValue(withSelect(updated));
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token()}`)
        .send({ name: 'Test User', githubUrl: 'https://github.com/test' });
      expect(res.statusCode).toBe(200);
      expect(res.body.githubUrl).toBe('https://github.com/test');
    });

    it('returns 500 when database throws', async () => {
      User.findOne.mockResolvedValue(mockUserData);
      User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB')) });
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token()}`)
        .send({ name: 'Test User' });
      expect(res.statusCode).toBe(500);
    });
  });

  // ── GET /api/users/search ─────────────────────────────────────────────────
  describe('GET /api/users/search', () => {
    it('returns users matching requested skills', async () => {
      User.find.mockReturnValue(withSelect([mockUserData]));
      const res = await request(app).get('/api/users/search?skills=React,Node.js');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 400 when skills param is missing', async () => {
      const res = await request(app).get('/api/users/search');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Skills parameter is required');
    });

    it('returns empty array when no users match', async () => {
      User.find.mockReturnValue(withSelect([]));
      const res = await request(app).get('/api/users/search?skills=Rust');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('trims whitespace in skills query', async () => {
      User.find.mockReturnValue(withSelect([mockUserData]));
      const res = await request(app).get('/api/users/search?skills= React , Node.js ');
      expect(res.statusCode).toBe(200);
      const callArg = User.find.mock.calls[0][0];
      expect(callArg.skills.$in).toEqual(['React', 'Node.js']);
    });

    it('returns 500 when database throws', async () => {
      User.find.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB')) });
      const res = await request(app).get('/api/users/search?skills=React');
      expect(res.statusCode).toBe(500);
    });
  });
});
