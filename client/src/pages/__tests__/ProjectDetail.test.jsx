import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProjectDetail from '../ProjectDetail';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/api', () => ({
  projectAPI: {
    getProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

const { projectAPI } = await import('../../services/api');

let mockUseAuth;
vi.mock('../../contexts/AuthContext', async (importActual) => {
  const actual = await importActual();
  return { ...actual, useAuth: () => mockUseAuth() };
});

const mockProject = {
  _id: 'proj1',
  title: 'Awesome Project',
  description: 'An amazing project',
  techStack: ['React', 'Node.js'],
  githubUrl: 'https://github.com/test/awesome',
  demoUrl: 'https://demo.awesome.com',
  owner: 'user1',
};

const renderDetail = (id = 'proj1') =>
  render(
    <MemoryRouter initialEntries={[`/projects/${id}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth = () => ({ currentUser: { _id: 'user1' }, loading: false });
    projectAPI.getProject.mockResolvedValue({ data: mockProject });
    projectAPI.deleteProject.mockResolvedValue({});
  });

  it('renders project title after loading', async () => {
    renderDetail();
    expect(await screen.findByText('Awesome Project')).toBeInTheDocument();
  });

  it('renders project description', async () => {
    renderDetail();
    expect(await screen.findByText('An amazing project')).toBeInTheDocument();
  });

  it('renders tech stack items', async () => {
    renderDetail();
    expect(await screen.findByText('React')).toBeInTheDocument();
    expect(await screen.findByText('Node.js')).toBeInTheDocument();
  });

  it('renders GitHub URL link', async () => {
    renderDetail();
    const link = await screen.findByText('https://github.com/test/awesome');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/test/awesome');
  });

  it('renders demo URL link', async () => {
    renderDetail();
    const link = await screen.findByText('https://demo.awesome.com');
    expect(link).toBeInTheDocument();
  });

  it('shows Edit and Delete buttons for the project owner', async () => {
    renderDetail();
    expect(await screen.findByText('Edit Project')).toBeInTheDocument();
    expect(await screen.findByText('Delete Project')).toBeInTheDocument();
  });

  it('hides Edit and Delete buttons for non-owner', async () => {
    mockUseAuth = () => ({ currentUser: { _id: 'otheruser' }, loading: false });
    renderDetail();
    await screen.findByText('Awesome Project');
    expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
  });

  it('hides Edit and Delete buttons when not logged in', async () => {
    mockUseAuth = () => ({ currentUser: null, loading: false });
    renderDetail();
    await screen.findByText('Awesome Project');
    expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    projectAPI.getProject.mockRejectedValue({
      response: { data: { message: 'Project not found' } },
    });
    renderDetail();
    expect(await screen.findByText('Project not found')).toBeInTheDocument();
  });

  it('shows generic error message when fetch fails without response', async () => {
    projectAPI.getProject.mockRejectedValue(new Error('Network error'));
    renderDetail();
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('deletes project and navigates to dashboard on confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDetail();
    await screen.findByText('Delete Project');
    fireEvent.click(screen.getByText('Delete Project'));
    await waitFor(() => {
      expect(projectAPI.deleteProject).toHaveBeenCalledWith('proj1');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('does not delete when user cancels the dialog', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderDetail();
    await screen.findByText('Delete Project');
    fireEvent.click(screen.getByText('Delete Project'));
    expect(projectAPI.deleteProject).not.toHaveBeenCalled();
  });

  it('shows error when delete fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    projectAPI.deleteProject.mockRejectedValue({
      response: { data: { message: 'Delete failed' } },
    });
    renderDetail();
    await screen.findByText('Delete Project');
    fireEvent.click(screen.getByText('Delete Project'));
    expect(await screen.findByText('Delete failed')).toBeInTheDocument();
  });

  it('does not render github section when no githubUrl', async () => {
    projectAPI.getProject.mockResolvedValue({
      data: { ...mockProject, githubUrl: undefined },
    });
    renderDetail();
    await screen.findByText('Awesome Project');
    expect(screen.queryByText('GitHub Repository')).not.toBeInTheDocument();
  });

  it('does not render demo section when no demoUrl', async () => {
    projectAPI.getProject.mockResolvedValue({
      data: { ...mockProject, demoUrl: undefined },
    });
    renderDetail();
    await screen.findByText('Awesome Project');
    expect(screen.queryByText('Live Demo')).not.toBeInTheDocument();
  });
});
