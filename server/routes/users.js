const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', userController.getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', userController.getUserById);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('skills', 'Skills must be an array').optional().isArray()
    ]
  ],
  userController.updateProfile
);

// @route   GET api/users/search
// @desc    Search users by skills
// @access  Public
router.get('/search', userController.searchUsersBySkills);

module.exports = router; 