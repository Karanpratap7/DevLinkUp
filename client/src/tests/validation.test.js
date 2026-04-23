import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUrl,
  validateProjectForm,
  validateProfileForm,
  validateRegisterForm,
  validateLoginForm,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('invalidates incorrect email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@missing-local.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates correct passwords', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('ComplexPass1')).toBe(true);
    });

    it('invalidates incorrect passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('no-numbers')).toBe(false);
      expect(validatePassword('no-uppercase1')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('validates non-empty strings', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('  test  ')).toBe(true);
    });

    it('invalidates empty strings', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('validates strings with minimum length', () => {
      expect(validateMinLength('test', 3)).toBe(true);
      expect(validateMinLength('test', 4)).toBe(true);
    });

    it('invalidates strings below minimum length', () => {
      expect(validateMinLength('te', 3)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('validates strings within maximum length', () => {
      expect(validateMaxLength('test', 5)).toBe(true);
      expect(validateMaxLength('test', 4)).toBe(true);
    });

    it('invalidates strings exceeding maximum length', () => {
      expect(validateMaxLength('testing', 5)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('validates correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('invalidates incorrect URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('http://')).toBe(false);
    });

    it('accepts empty URLs', () => {
      expect(validateUrl('')).toBe(true);
      expect(validateUrl(null)).toBe(true);
      expect(validateUrl(undefined)).toBe(true);
    });
  });

  describe('validateProjectForm', () => {
    it('validates correct project data', () => {
      const validProject = {
        title: 'Test Project',
        description: 'This is a test project description',
        techStack: ['React', 'Node.js'],
        githubUrl: 'https://github.com/user/repo',
        liveDemoUrl: 'https://example.com',
      };

      expect(validateProjectForm(validProject)).toEqual({});
    });

    it('returns errors for invalid project data', () => {
      const invalidProject = {
        title: '',
        description: 'short',
        techStack: [],
      };

      const errors = validateProjectForm(invalidProject);
      expect(errors.title).toBeDefined();
      expect(errors.description).toBeDefined();
      expect(errors.techStack).toBeDefined();
    });
  });

  describe('validateProfileForm', () => {
    it('validates correct profile data', () => {
      const validProfile = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Developer',
        skills: ['JavaScript', 'React'],
      };

      expect(validateProfileForm(validProfile)).toEqual({});
    });

    it('returns errors for invalid profile data', () => {
      const invalidProfile = {
        name: '',
        email: 'invalid-email',
        skills: [],
      };

      const errors = validateProfileForm(invalidProfile);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.skills).toBeDefined();
    });
  });

  describe('validateRegisterForm', () => {
    it('validates correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      expect(validateRegisterForm(validData)).toEqual({});
    });

    it('returns errors for invalid registration data', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
      };

      const errors = validateRegisterForm(invalidData);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
    });
  });

  describe('validateLoginForm', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'Password123',
      };

      expect(validateLoginForm(validData)).toEqual({});
    });

    it('returns errors for invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      const errors = validateLoginForm(invalidData);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });
}); 