export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value) => {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
};

export const validateMinLength = (value, minLength) => {
  return typeof value === 'string' ? value.trim().length >= minLength : false;
};

export const validateMaxLength = (value, maxLength) => {
  return typeof value === 'string' ? value.trim().length <= maxLength : false;
};

export const validateUrl = (url) => {
  if (!url) return true; // Optional URLs are valid
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateProjectForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.title)) {
    errors.title = 'Title is required';
  } else if (!validateMinLength(formData.title, 3)) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!validateRequired(formData.description)) {
    errors.description = 'Description is required';
  } else if (!validateMinLength(formData.description, 10)) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!formData.techStack || formData.techStack.length === 0) {
    errors.techStack = 'At least one technology is required';
  }

  if (formData.githubUrl && !validateUrl(formData.githubUrl)) {
    errors.githubUrl = 'Please enter a valid GitHub URL';
  }

  if (formData.liveDemoUrl && !validateUrl(formData.liveDemoUrl)) {
    errors.liveDemoUrl = 'Please enter a valid URL';
  }

  return errors;
};

export const validateProfileForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.bio && !validateMaxLength(formData.bio, 500)) {
    errors.bio = 'Bio must not exceed 500 characters';
  }

  if (!formData.skills || formData.skills.length === 0) {
    errors.skills = 'At least one skill is required';
  }

  return errors;
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateRequired(formData.password)) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers';
  }

  if (!validateRequired(formData.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateLoginForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateRequired(formData.password)) {
    errors.password = 'Password is required';
  }

  return errors;
}; 