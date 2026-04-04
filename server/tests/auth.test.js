const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// ─── Mongoose mock ───────────────────────────────────────────────────────────
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
  };
});

// ─── Model mocks ─────────────────────────────────────────────────────────────
const mockUserData = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
};

jest.mock('../models/User', () => {
  const MockUser = jest.fn().mockImplementation((data) => ({
    ...mockUserData,
    ...data,
    save: jest.fn().mockResolvedValue(undefined),
  }));
  MockUser.findOne = jest.fn();
  MockUser.findById = jest.fn();
  return MockUser;
});

jest.mock('../models/Project', () => ({}));

const User = require('../models/User');

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const makeToken = (userId = 'user123') =>
  jwt.sign({ userId }, process.env.JWT_SECRET);

const withSelect = (value) => ({ select: jest.fn().mockResolvedValue(value) });

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('Auth Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── POST /signup ──────────────────────────────────────────────────────────
  describe('POST /api/auth/signup', () => {
    it('creates a new user and returns token', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Alice', email: 'alice@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('alice@example.com');
      // _id must be returned (not 'id') so the client can use currentUser._id immediately
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user).not.toHaveProperty('id');
    });

    it('rejects duplicate email', async () => {
      User.findOne.mockResolvedValue(mockUserData);
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Alice', email: 'alice@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('rejects missing name', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'alice@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.some((e) => e.path === 'name')).toBe(true);
    });

    it('rejects invalid email', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Alice', email: 'not-an-email', password: 'secret123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'email')).toBe(true);
    });

    it('rejects password shorter than 6 characters', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Alice', email: 'alice@example.com', password: 'abc',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'password')).toBe(true);
    });

    it('returns 500 when database throws', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Alice', email: 'alice@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(500);
    });
  });

  // ── POST /login ───────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      User.findOne.mockResolvedValue({
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
      });
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
      // _id must be returned (not 'id') so the client can use currentUser._id immediately
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user).not.toHaveProperty('id');
    });

    it('rejects wrong password', async () => {
      User.findOne.mockResolvedValue({
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(false),
      });
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com', password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('rejects unknown email', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('rejects invalid email format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'not-an-email', password: 'secret123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'email')).toBe(true);
    });

    it('rejects missing password field', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'password')).toBe(true);
    });

    it('returns 500 when database throws', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com', password: 'secret123',
      });
      expect(res.statusCode).toBe(500);
    });
  });

  // ── GET /me ───────────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('returns current user when authenticated', async () => {
      const token = makeToken();
      const profile = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
      // auth middleware calls User.findOne; controller calls User.findById
      User.findOne.mockResolvedValue(mockUserData);
      User.findById.mockReturnValue(withSelect(profile));
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('test@example.com');
    });

    it('returns 401 when no token provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 when token is malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not.a.real.token');
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 when token user no longer exists', async () => {
      const token = makeToken();
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when user not found by controller', async () => {
      const token = makeToken();
      User.findOne.mockResolvedValue(mockUserData);
      User.findById.mockReturnValue(withSelect(null));
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it('returns 500 when database throws in controller', async () => {
      const token = makeToken();
      User.findOne.mockResolvedValue(mockUserData);
      User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB')) });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });
});
