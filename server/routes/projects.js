const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get('/', projectController.getAllProjects);

// @route   GET api/projects/search
// @desc    Search projects by tech stack
// @access  Public
router.get('/search', projectController.searchProjectsByTech);

// @route   GET api/projects/user/:userId
// @desc    Get user's projects
// @access  Public
router.get('/user/:userId', projectController.getUserProjects);

// @route   POST api/projects
// @desc    Create a project
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('techStack', 'Tech stack must be an array').isArray()
    ]
  ],
  projectController.createProject
);

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', projectController.getProjectById);

// @route   PUT api/projects/:id
// @desc    Update project
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('techStack', 'Tech stack must be an array').isArray()
    ]
  ],
  projectController.updateProject
);

// @route   DELETE api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router; 