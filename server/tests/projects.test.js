const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// ─── Mongoose mock ───────────────────────────────────────────────────────────
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(undefined) };
});

// ─── Model mocks ─────────────────────────────────────────────────────────────
const VALID_OID = 'aabbccdd11223344556677aa';

const mockUserData = {
  _id: 'user123',
  name: 'Owner User',
  email: 'owner@example.com',
};

const mockProjectData = {
  _id: VALID_OID,
  title: 'Test Project',
  description: 'A great project',
  techStack: ['Node.js', 'React'],
  githubUrl: 'https://github.com/test/project',
  demoUrl: 'https://demo.example.com',
  owner: { toString: () => 'user123' },
  deleteOne: jest.fn().mockResolvedValue({}),
};

jest.mock('../models/User', () => {
  const MockUser = jest.fn();
  MockUser.findOne = jest.fn();
  return MockUser;
});

jest.mock('../models/Project', () => {
  const MockProject = jest.fn().mockImplementation((data) => ({
    ...mockProjectData,
    ...data,
    save: jest.fn().mockResolvedValue(undefined),
  }));
  MockProject.find = jest.fn();
  MockProject.findById = jest.fn();
  MockProject.findByIdAndUpdate = jest.fn();
  MockProject.findByIdAndDelete = jest.fn();
  return MockProject;
});

const User = require('../models/User');
const Project = require('../models/Project');

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/projects', require('../routes/projects'));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const makeToken = (userId = 'user123') =>
  jwt.sign({ userId }, process.env.JWT_SECRET);

const populateMock = (value) => ({
  populate: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(value),
    sort: jest.fn().mockResolvedValue(value),
  }),
  sort: jest.fn().mockResolvedValue(value),
});

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('Project Routes', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = makeToken();
    User.findOne.mockResolvedValue(mockUserData);
  });

  // ── POST /api/projects ────────────────────────────────────────────────────
  describe('POST /api/projects', () => {
    it('creates a project with valid data', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Project', description: 'A project', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title');
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ title: 'My Project', description: 'A project', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'A project', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'title')).toBe(true);
    });

    it('returns 400 when description is missing', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Project', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'description')).toBe(true);
    });

    it('returns 400 when techStack is not an array', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Project', description: 'A project', techStack: 'Node.js' });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.path === 'techStack')).toBe(true);
    });

    it('accepts optional githubUrl and demoUrl', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Project',
          description: 'A project',
          techStack: ['Node.js'],
          githubUrl: 'https://github.com/test/project',
          demoUrl: 'https://demo.example.com',
        });
      expect(res.statusCode).toBe(201);
    });
  });

  // ── GET /api/projects ─────────────────────────────────────────────────────
  describe('GET /api/projects', () => {
    it('returns all projects', async () => {
      Project.find.mockReturnValue(populateMock([mockProjectData]));
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns empty array when no projects exist', async () => {
      Project.find.mockReturnValue(populateMock([]));
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 500 when database throws', async () => {
      Project.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('DB')),
        }),
      });
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(500);
    });
  });

  // ── GET /api/projects/:id ─────────────────────────────────────────────────
  describe('GET /api/projects/:id', () => {
    it('returns project by valid ObjectId', async () => {
      Project.findById.mockReturnValue(populateMock(mockProjectData));
      const res = await request(app).get(`/api/projects/${VALID_OID}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Test Project');
    });

    it('returns 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/projects/not-a-valid-id');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid project ID format');
    });

    it('returns 404 when project not found', async () => {
      Project.findById.mockReturnValue(populateMock(null));
      const res = await request(app).get(`/api/projects/${VALID_OID}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('returns 500 when database throws', async () => {
      Project.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error('DB')),
        }),
      });
      const res = await request(app).get(`/api/projects/${VALID_OID}`);
      expect(res.statusCode).toBe(500);
    });
  });

  // ── GET /api/projects/search ──────────────────────────────────────────────
  describe('GET /api/projects/search', () => {
    it('returns projects matching tech stack', async () => {
      Project.find.mockReturnValue(populateMock([mockProjectData]));
      const res = await request(app).get('/api/projects/search?tech=Node.js');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 400 when tech param is missing', async () => {
      const res = await request(app).get('/api/projects/search');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Tech parameter is required');
    });

    it('trims whitespace in tech query', async () => {
      Project.find.mockReturnValue(populateMock([]));
      await request(app).get('/api/projects/search?tech= Node.js , React ');
      const callArg = Project.find.mock.calls[0][0];
      expect(callArg.techStack.$in).toEqual(['Node.js', 'React']);
    });

    it('returns 500 when database throws', async () => {
      Project.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('DB')),
        }),
      });
      const res = await request(app).get('/api/projects/search?tech=React');
      expect(res.statusCode).toBe(500);
    });
  });

  // ── GET /api/projects/user/:userId ────────────────────────────────────────
  describe('GET /api/projects/user/:userId', () => {
    it('returns projects for a given user', async () => {
      Project.find.mockReturnValue(populateMock([mockProjectData]));
      const res = await request(app).get('/api/projects/user/user123');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns empty array when user has no projects', async () => {
      Project.find.mockReturnValue(populateMock([]));
      const res = await request(app).get('/api/projects/user/user456');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 500 when database throws', async () => {
      Project.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('DB')),
        }),
      });
      const res = await request(app).get('/api/projects/user/user123');
      expect(res.statusCode).toBe(500);
    });
  });

  // ── PUT /api/projects/:id ─────────────────────────────────────────────────
  describe('PUT /api/projects/:id', () => {
    it('updates a project the user owns', async () => {
      const updated = { ...mockProjectData, title: 'Updated Title' };
      Project.findById.mockResolvedValue(mockProjectData);
      Project.findByIdAndUpdate.mockResolvedValue(updated);
      const res = await request(app)
        .put(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', description: 'Desc', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .put(`/api/projects/${VALID_OID}`)
        .send({ title: 'Updated', description: 'Desc', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .put(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Desc', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when project not found', async () => {
      Project.findById.mockResolvedValue(null);
      const res = await request(app)
        .put(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', description: 'Desc', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(404);
    });

    it('returns 401 when user is not the owner', async () => {
      const otherProject = {
        ...mockProjectData,
        owner: { toString: () => 'otheruser999' },
      };
      Project.findById.mockResolvedValue(otherProject);
      const res = await request(app)
        .put(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', description: 'Desc', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized');
    });

    it('returns 500 when database throws', async () => {
      Project.findById.mockRejectedValue(new Error('DB'));
      const res = await request(app)
        .put(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', description: 'Desc', techStack: ['Node.js'] });
      expect(res.statusCode).toBe(500);
    });
  });

  // ── DELETE /api/projects/:id ──────────────────────────────────────────────
  describe('DELETE /api/projects/:id', () => {
    it('deletes project the user owns', async () => {
      Project.findById.mockResolvedValue(mockProjectData);
      const res = await request(app)
        .delete(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Project deleted');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete(`/api/projects/${VALID_OID}`);
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when project not found', async () => {
      Project.findById.mockResolvedValue(null);
      const res = await request(app)
        .delete(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('returns 401 when user is not the owner', async () => {
      const otherProject = {
        ...mockProjectData,
        owner: { toString: () => 'otheruser999' },
      };
      Project.findById.mockResolvedValue(otherProject);
      const res = await request(app)
        .delete(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized');
    });

    it('returns 500 when database throws', async () => {
      Project.findById.mockRejectedValue(new Error('DB'));
      const res = await request(app)
        .delete(`/api/projects/${VALID_OID}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });
});
