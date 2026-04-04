import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

let mockUseAuth;
vi.mock('../../contexts/AuthContext', async (importActual) => {
  const actual = await importActual();
  return { ...actual, useAuth: () => mockUseAuth() };
});

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

const fillForm = ({ name = 'Alice', email = 'alice@example.com', password = 'secret123', confirmPassword = 'secret123' } = {}) => {
  if (name !== undefined) {
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: name } });
  }
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: confirmPassword } });
};

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth = () => ({
      currentUser: null,
      loading: false,
      register: vi.fn().mockResolvedValue({ _id: 'user1' }),
      error: '',
    });
  });

  it('renders the registration form', () => {
    renderRegister();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    renderRegister();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders a Create account button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows a link to login page', () => {
    renderRegister();
    expect(screen.getByText(/sign in to your existing account/i)).toBeInTheDocument();
  });

  it('calls register and navigates to dashboard on success', async () => {
    const mockRegister = vi.fn().mockResolvedValue({ _id: 'user1' });
    mockUseAuth = () => ({
      currentUser: null, loading: false, register: mockRegister, error: '',
    });
    renderRegister();
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Alice', 'alice@example.com', 'secret123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error when passwords do not match', async () => {
    renderRegister();
    fillForm({ password: 'secret123', confirmPassword: 'different456' });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error message when register API call fails', async () => {
    const mockRegister = vi.fn().mockRejectedValue({
      response: { data: { message: 'Email already in use' } },
    });
    mockUseAuth = () => ({
      currentUser: null, loading: false, register: mockRegister, error: '',
    });
    renderRegister();
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });

  it('shows fallback error message when API error has no message', async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error('server down'));
    mockUseAuth = () => ({
      currentUser: null, loading: false, register: mockRegister, error: '',
    });
    renderRegister();
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    expect(await screen.findByText('Failed to create account')).toBeInTheDocument();
  });

  it('shows "Creating account..." while loading', async () => {
    const mockRegister = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 300))
    );
    mockUseAuth = () => ({
      currentUser: null, loading: false, register: mockRegister, error: '',
    });
    renderRegister();
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    expect(await screen.findByText('Creating account...')).toBeInTheDocument();
  });

  it('does not call register when passwords do not match', async () => {
    const mockRegister = vi.fn();
    mockUseAuth = () => ({
      currentUser: null, loading: false, register: mockRegister, error: '',
    });
    renderRegister();
    fillForm({ password: 'aaa', confirmPassword: 'bbb' });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });
});
