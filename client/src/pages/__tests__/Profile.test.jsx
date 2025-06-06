import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Profile from '../Profile';
import { AuthProvider } from '../../contexts/AuthContext';
import { userAPI, projectAPI } from '../../services/api';

// Mock the API calls
vi.mock('../../services/api', () => ({
  userAPI: {
    getUser: vi.fn(),
  },
  projectAPI: {
    getUserProjects: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Dynamic mock for useAuth
let mockUseAuth;
vi.mock('../../contexts/AuthContext', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

const renderProfile = (route = '/profile/123', props = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/profile/:id" element={<Profile {...props} />} />
          <Route path="/profile" element={<Profile {...props} />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Profile Component', () => {
  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    bio: 'Test bio',
    skills: ['React', 'Node.js'],
  };

  const mockProjects = [
    {
      _id: '1',
      title: 'Test Project',
      description: 'Test description',
      techStack: ['React', 'Node.js'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    userAPI.getUser.mockResolvedValue({ data: mockUser });
    projectAPI.getUserProjects.mockResolvedValue({ data: mockProjects });
    mockUseAuth = () => ({
      currentUser: { _id: '123', name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders loading state initially', () => {
    mockUseAuth = () => ({
      currentUser: null,
      loading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    renderProfile();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders profile data when loaded', async () => {
    mockUseAuth = () => ({
      currentUser: { _id: '123', name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    renderProfile();
    // Debug output
    // eslint-disable-next-line no-console
    console.log(document.body.innerHTML);
    // Use findByText for async rendering
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(await screen.findByText('test@example.com')).toBeInTheDocument();
    expect(await screen.findByText('Test bio')).toBeInTheDocument();
  });

  it('renders user skills', async () => {
    mockUseAuth = () => ({
      currentUser: { _id: '123', name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    renderProfile();
    // Debug output
    // eslint-disable-next-line no-console
    console.log(document.body.innerHTML);
    // Use findByText with a function matcher for robustness
    expect(await screen.findByText((content) => content.includes('React'))).toBeInTheDocument();
    expect(await screen.findByText((content) => content.includes('Node.js'))).toBeInTheDocument();
  });

  it('renders projects when available', async () => {
    mockUseAuth = () => ({
      currentUser: { _id: '123', name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    renderProfile();
    // Debug output
    // eslint-disable-next-line no-console
    console.log(document.body.innerHTML);
    // Use findByText with a function matcher for robustness
    expect(await screen.findByText((content) => content.includes('Test Project'))).toBeInTheDocument();
    expect(await screen.findByText((content) => content.includes('Test description'))).toBeInTheDocument();
  });

  it('shows error message when profile fetch fails', async () => {
    userAPI.getUser.mockRejectedValue(new Error('Failed to fetch'));
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('redirects to login when no user ID is available', async () => {
    mockUseAuth = () => ({
      currentUser: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    userAPI.getUser.mockResolvedValue({ data: null });
    renderProfile();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows "No projects found" when user has no projects', async () => {
    mockUseAuth = () => ({
      currentUser: { _id: '123', name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    projectAPI.getUserProjects.mockResolvedValue({ data: [] });
    renderProfile();
    // Debug output
    // eslint-disable-next-line no-console
    console.log(document.body.innerHTML);
    await waitFor(() => {
      expect(screen.getByText('No projects found')).toBeInTheDocument();
    });
  });
}); 