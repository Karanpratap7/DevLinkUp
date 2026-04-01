import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/api', () => ({
  projectAPI: {
    getUserProjects: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

const { projectAPI } = await import('../../services/api');

let mockUseAuth;
vi.mock('../../contexts/AuthContext', async (importActual) => {
  const actual = await importActual();
  return { ...actual, useAuth: () => mockUseAuth() };
});

const mockProjects = [
  {
    _id: 'proj1',
    title: 'Alpha Project',
    description: 'First project',
    techStack: ['React'],
  },
  {
    _id: 'proj2',
    title: 'Beta Project',
    description: 'Second project',
    techStack: ['Node.js'],
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth = () => ({
      currentUser: { _id: 'user1', name: 'Alice' },
      loading: false,
    });
    projectAPI.getUserProjects.mockResolvedValue({ data: mockProjects });
    projectAPI.deleteProject.mockResolvedValue({});
  });

  it('shows "Please log in" message when no user', async () => {
    mockUseAuth = () => ({ currentUser: null, loading: false });
    renderDashboard();
    expect(await screen.findByText(/please log in/i)).toBeInTheDocument();
  });

  it('renders dashboard heading when user is logged in', async () => {
    renderDashboard();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('renders list of user projects', async () => {
    renderDashboard();
    expect(await screen.findByText('Alpha Project')).toBeInTheDocument();
    expect(await screen.findByText('Beta Project')).toBeInTheDocument();
  });

  it('renders empty state message when user has no projects', async () => {
    projectAPI.getUserProjects.mockResolvedValue({ data: [] });
    renderDashboard();
    expect(
      await screen.findByText(/you haven't created any projects yet/i)
    ).toBeInTheDocument();
  });

  it('shows error when project fetch fails', async () => {
    projectAPI.getUserProjects.mockRejectedValue(new Error('fetch failed'));
    renderDashboard();
    expect(await screen.findByText(/failed to fetch projects/i)).toBeInTheDocument();
  });

  it('renders a "Create New Project" link', async () => {
    renderDashboard();
    expect(await screen.findByText('Create New Project')).toBeInTheDocument();
  });

  it('renders View Project links for each project', async () => {
    renderDashboard();
    const viewLinks = await screen.findAllByText(/view project/i);
    expect(viewLinks.length).toBe(2);
  });

  it('renders Edit links for each project', async () => {
    renderDashboard();
    const editLinks = await screen.findAllByText('Edit');
    expect(editLinks.length).toBe(2);
  });

  it('renders tech stack tags for each project', async () => {
    renderDashboard();
    expect(await screen.findByText('React')).toBeInTheDocument();
    expect(await screen.findByText('Node.js')).toBeInTheDocument();
  });

  it('deletes a project and removes it from the list after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDashboard();
    await screen.findByText('Alpha Project');
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(projectAPI.deleteProject).toHaveBeenCalledWith('proj1');
      expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument();
    });
  });

  it('does not delete when user cancels confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderDashboard();
    await screen.findByText('Alpha Project');
    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(projectAPI.deleteProject).not.toHaveBeenCalled();
    expect(screen.getByText('Alpha Project')).toBeInTheDocument();
  });

  it('shows error when delete fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    projectAPI.deleteProject.mockRejectedValue(new Error('delete failed'));
    renderDashboard();
    await screen.findByText('Alpha Project');
    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(await screen.findByText(/failed to delete project/i)).toBeInTheDocument();
  });

  it('does not fetch projects when currentUser has no _id', async () => {
    mockUseAuth = () => ({ currentUser: {}, loading: false });
    renderDashboard();
    await waitFor(() => {
      expect(projectAPI.getUserProjects).not.toHaveBeenCalled();
    });
  });
});
