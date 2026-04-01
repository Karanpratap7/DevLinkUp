import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

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

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth = () => ({
      currentUser: null,
      loading: false,
      login: vi.fn().mockResolvedValue({ _id: 'user1' }),
      register: vi.fn(),
      logout: vi.fn(),
      error: '',
    });
  });

  it('renders the Login form', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders a Sign In button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows a link to register', () => {
    renderLogin();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('updates email field when user types', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
    expect(emailInput.value).toBe('alice@example.com');
  });

  it('updates password field when user types', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    expect(passwordInput.value).toBe('secret123');
  });

  it('calls login and navigates on successful submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ _id: 'user1' });
    mockUseAuth = () => ({
      currentUser: null, loading: false, login: mockLogin, error: '',
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secret123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'secret123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error message when login fails', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    mockUseAuth = () => ({
      currentUser: null, loading: false, login: mockLogin, error: '',
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows fallback error message when response has no message', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('network error'));
    mockUseAuth = () => ({
      currentUser: null, loading: false, login: mockLogin, error: '',
    });
    renderLogin();
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    expect(await screen.findByText('Failed to log in')).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    const mockLogin = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 300))
    );
    mockUseAuth = () => ({
      currentUser: null, loading: false, login: mockLogin, error: '',
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secret123' },
    });
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByText('Signing in...')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /signing in/i });
    expect(btn).toBeDisabled();
  });
});
