const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('../../models/User');
const Project = require('../../models/Project');
const jwt = require('jsonwebtoken');

let mongoServer;
let testUser;
let authToken;

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
  await Project.deleteMany({});

  // Create a test user and generate token
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });

  authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
});

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('name', 'New User');
      expect(res.body.user).toHaveProperty('email', 'new@example.com');
    });

    it('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('name', 'Test User');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Please authenticate.');
    });
  });
});

describe('Projects API', () => {
  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Project',
          description: 'Test Description',
          techStack: ['React', 'Node.js'],
          githubUrl: 'https://github.com/test/project',
          demoUrl: 'https://demo.test.com'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Project');
      expect(res.body).toHaveProperty('description', 'Test Description');
      expect(res.body.techStack).toEqual(['React', 'Node.js']);
    });

    it('should not create project without authentication', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({
          title: 'Test Project',
          description: 'Test Description'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create some test projects
      await Project.create([
        {
          title: 'Project 1',
          description: 'Description 1',
          techStack: ['React'],
          owner: testUser._id
        },
        {
          title: 'Project 2',
          description: 'Description 2',
          techStack: ['Node.js'],
          owner: testUser._id
        }
      ]);
    });

    it('should get all projects', async () => {
      const res = await request(app)
        .get('/api/projects');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[1]).toHaveProperty('title');
    });
  });

  describe('GET /api/projects/:id', () => {
    let testProject;

    beforeEach(async () => {
      testProject = await Project.create({
        title: 'Test Project',
        description: 'Test Description',
        techStack: ['React'],
        owner: testUser._id
      });
    });

    it('should get project by id', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProject._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Test Project');
      expect(res.body).toHaveProperty('description', 'Test Description');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get(`/api/projects/${new mongoose.Types.ObjectId()}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Project not found');
    });
  });

  describe('PUT /api/projects/:id', () => {
    let testProject;

    beforeEach(async () => {
      testProject = await Project.create({
        title: 'Test Project',
        description: 'Test Description',
        techStack: ['React'],
        owner: testUser._id
      });
    });

    it('should update project', async () => {
      const res = await request(app)
        .put(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Project',
          description: 'Updated Description',
          techStack: ['React', 'Node.js']
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Project');
      expect(res.body).toHaveProperty('description', 'Updated Description');
      expect(res.body.techStack).toEqual(['React', 'Node.js']);
    });

    it('should not update project without authentication', async () => {
      const res = await request(app)
        .put(`/api/projects/${testProject._id}`)
        .send({
          title: 'Updated Project'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let testProject;

    beforeEach(async () => {
      testProject = await Project.create({
        title: 'Test Project',
        description: 'Test Description',
        techStack: ['React'],
        owner: testUser._id
      });
    });

    it('should delete project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Project deleted');

      // Verify project is deleted
      const deletedProject = await Project.findById(testProject._id);
      expect(deletedProject).toBeNull();
    });

    it('should not delete project without authentication', async () => {
      const res = await request(app)
        .delete(`/api/projects/${testProject._id}`);

      expect(res.status).toBe(401);
    });
  });
}); 