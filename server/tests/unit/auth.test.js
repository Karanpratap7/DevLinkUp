const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const authController = require('../../controllers/authController');
const jwt = require('jsonwebtoken');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Controller', () => {
  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com'
          })
        })
      );
    });

    it('should not create user with existing email', async () => {
      // First create a user
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });

      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User already exists'
        })
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user before each test
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com'
          })
        })
      );
    });

    it('should not login with incorrect password', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials'
        })
      );
    });

    it('should not login with non-existent email', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials'
        })
      );
    });
  });

  describe('getCurrentUser', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create a test user and generate token
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    });

    it('should get current user successfully', async () => {
      const req = {
        user: { _id: user._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com'
        })
      );
    });
  });
}); 