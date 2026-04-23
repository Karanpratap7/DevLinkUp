const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

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

describe('User Model', () => {
  it('should create a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Password should be hashed
  });

  it('should not create user without required fields', async () => {
    const userData = {
      name: 'Test User'
      // Missing email and password
    };

    try {
      await User.create(userData);
      fail('Should not create user without required fields');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('should not create user with invalid email', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };

    try {
      await User.create(userData);
      fail('Should not create user with invalid email');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('should not create user with duplicate email', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    await User.create(userData);

    try {
      await User.create(userData);
      fail('Should not create user with duplicate email');
    } catch (error) {
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    }
  });

  it('should hash password before saving', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);
    expect(user.password).not.toBe(userData.password);
    expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash starts with $2
  });

  it('should compare password correctly', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should update user profile fields', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);

    const updateData = {
      bio: 'Test bio',
      skills: ['JavaScript', 'React'],
      githubUrl: 'https://github.com/testuser',
      linkedinUrl: 'https://linkedin.com/in/testuser'
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true }
    );

    expect(updatedUser.bio).toBe(updateData.bio);
    expect(updatedUser.skills).toEqual(updateData.skills);
    expect(updatedUser.githubUrl).toBe(updateData.githubUrl);
    expect(updatedUser.linkedinUrl).toBe(updateData.linkedinUrl);
  });
}); 