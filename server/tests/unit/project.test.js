const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Project = require('../../models/Project');
const User = require('../../models/User');
const projectController = require('../../controllers/projectController');

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Project.deleteMany({});
  await User.deleteMany({});
  
  // Create a test user for project ownership
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
});

describe('Project Model', () => {
  it('should create a project successfully', async () => {
    const projectData = {
      title: 'Test Project',
      description: 'Test Description',
      techStack: ['React', 'Node.js'],
      githubUrl: 'https://github.com/test/project',
      demoUrl: 'https://demo.test.com',
      owner: testUser._id
    };

    const project = await Project.create(projectData);

    expect(project.title).toBe(projectData.title);
    expect(project.description).toBe(projectData.description);
    expect(project.techStack).toEqual(projectData.techStack);
    expect(project.githubUrl).toBe(projectData.githubUrl);
    expect(project.demoUrl).toBe(projectData.demoUrl);
    expect(project.owner.toString()).toBe(testUser._id.toString());
  });

  it('should not create project without required fields', async () => {
    const projectData = {
      description: 'Test Description',
      techStack: ['React', 'Node.js']
      // Missing title and owner
    };

    try {
      await Project.create(projectData);
      fail('Should not create project without required fields');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('should update project fields', async () => {
    const project = await Project.create({
      title: 'Test Project',
      description: 'Test Description',
      techStack: ['React'],
      owner: testUser._id
    });

    const updateData = {
      title: 'Updated Project',
      description: 'Updated Description',
      techStack: ['React', 'Node.js', 'MongoDB']
    };

    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      { $set: updateData },
      { new: true }
    );

    expect(updatedProject.title).toBe(updateData.title);
    expect(updatedProject.description).toBe(updateData.description);
    expect(updatedProject.techStack).toEqual(updateData.techStack);
  });
});

describe('Project Controller', () => {
  describe('createProject', () => {
    it('should create a new project successfully', async () => {
      const req = {
        body: {
          title: 'Test Project',
          description: 'Test Description',
          techStack: ['React', 'Node.js'],
          githubUrl: 'https://github.com/test/project',
          demoUrl: 'https://demo.test.com'
        },
        user: { _id: testUser._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.createProject(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Project',
          description: 'Test Description',
          techStack: ['React', 'Node.js']
        })
      );
    });
  });

  describe('getAllProjects', () => {
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
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.getAllProjects(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Project 1'
          }),
          expect.objectContaining({
            title: 'Project 2'
          })
        ])
      );
    });
  });

  describe('getProjectById', () => {
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
      const req = {
        params: { id: testProject._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.getProjectById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Project',
          description: 'Test Description'
        })
      );
    });

    it('should return 404 for non-existent project', async () => {
      const req = {
        params: { id: new mongoose.Types.ObjectId() }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.getProjectById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project not found'
        })
      );
    });
  });

  describe('updateProject', () => {
    let testProject;

    beforeEach(async () => {
      testProject = await Project.create({
        title: 'Test Project',
        description: 'Test Description',
        techStack: ['React'],
        owner: testUser._id
      });
    });

    it('should update project successfully', async () => {
      const req = {
        params: { id: testProject._id },
        body: {
          title: 'Updated Project',
          description: 'Updated Description',
          techStack: ['React', 'Node.js']
        },
        user: { _id: testUser._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.updateProject(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Project',
          description: 'Updated Description',
          techStack: ['React', 'Node.js']
        })
      );
    });

    it('should not update project with invalid id', async () => {
      const req = {
        params: { id: 'invalid-id' },
        body: {
          title: 'Updated Project'
        },
        user: { _id: testUser._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.updateProject(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid project ID'
        })
      );
    });
  });

  describe('deleteProject', () => {
    let testProject;

    beforeEach(async () => {
      testProject = await Project.create({
        title: 'Test Project',
        description: 'Test Description',
        techStack: ['React'],
        owner: testUser._id
      });
    });

    it('should delete project successfully', async () => {
      const req = {
        params: { id: testProject._id },
        user: { _id: testUser._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await projectController.deleteProject(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project deleted'
        })
      );

      // Verify project is deleted
      const deletedProject = await Project.findById(testProject._id);
      expect(deletedProject).toBeNull();
    });
  });
}); 