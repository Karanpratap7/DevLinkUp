import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Discover from '../Discover';

vi.mock('../../services/api', () => ({
  userAPI: { getAllUsers: vi.fn() },
  projectAPI: { getAllProjects: vi.fn() },
}));

const { userAPI, projectAPI } = await import('../../services/api');

const mockDevelopers = [
  { _id: 'd1', name: 'Alice Dev', bio: 'Frontend', skills: ['React', 'TypeScript'] },
  { _id: 'd2', name: 'Bob Build', bio: 'Backend', skills: ['Node.js', 'MongoDB'] },
];

const mockProjects = [
  { _id: 'p1', title: 'Cool App', description: 'App desc', techStack: ['React'] },
  { _id: 'p2', title: 'API Server', description: 'Server', techStack: ['Node.js'] },
];

const renderDiscover = () =>
  render(
    <MemoryRouter>
      <Discover />
    </MemoryRouter>
  );

describe('Discover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userAPI.getAllUsers.mockResolvedValue({ data: mockDevelopers });
    projectAPI.getAllProjects.mockResolvedValue({ data: mockProjects });
  });

  it('renders the Discover heading', async () => {
    renderDiscover();
    expect(await screen.findByText('Discover')).toBeInTheDocument();
  });

  it('renders developer names after load', async () => {
    renderDiscover();
    expect(await screen.findByText('Alice Dev')).toBeInTheDocument();
    expect(await screen.findByText('Bob Build')).toBeInTheDocument();
  });

  it('switches to projects tab and shows project titles', async () => {
    renderDiscover();
    await screen.findByText('Alice Dev');
    fireEvent.click(screen.getByRole('button', { name: /projects/i }));
    expect(await screen.findByText('Cool App')).toBeInTheDocument();
    expect(await screen.findByText('API Server')).toBeInTheDocument();
  });

  it('filters developers by search term', async () => {
    renderDiscover();
    await screen.findByText('Alice Dev');
    fireEvent.change(screen.getByPlaceholderText(/search developers/i), {
      target: { value: 'Alice' },
    });
    expect(screen.getByText('Alice Dev')).toBeInTheDocument();
    expect(screen.queryByText('Bob Build')).not.toBeInTheDocument();
  });

  it('shows "No developers found." when search yields no results', async () => {
    renderDiscover();
    await screen.findByText('Alice Dev');
    fireEvent.change(screen.getByPlaceholderText(/search developers/i), {
      target: { value: 'xyznonexistent' },
    });
    expect(screen.getByText('No developers found.')).toBeInTheDocument();
  });

  it('filters developers by skill badge', async () => {
    renderDiscover();
    await screen.findByText('Alice Dev');
    fireEvent.click(screen.getByRole('button', { name: /^React$/ }));
    expect(screen.getByText('Alice Dev')).toBeInTheDocument();
    expect(screen.queryByText('Bob Build')).not.toBeInTheDocument();
  });

  it('clears skill filter when "Clear all filters" is clicked', async () => {
    renderDiscover();
    await screen.findByText('Alice Dev');
    fireEvent.click(screen.getByRole('button', { name: /^React$/ }));
    expect(screen.queryByText('Bob Build')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear all filters'));
    expect(await screen.findByText('Bob Build')).toBeInTheDocument();
  });

  it('shows error when API call fails', async () => {
    userAPI.getAllUsers.mockRejectedValue(new Error('Network error'));
    projectAPI.getAllProjects.mockRejectedValue(new Error('Network error'));
    renderDiscover();
    expect(
      await screen.findByText(/failed to fetch data/i)
    ).toBeInTheDocument();
  });

  it('shows API error message from response', async () => {
    userAPI.getAllUsers.mockRejectedValue({
      response: { data: { message: 'Unauthorized' } },
    });
    projectAPI.getAllProjects.mockRejectedValue({
      response: { data: { message: 'Unauthorized' } },
    });
    renderDiscover();
    expect(await screen.findByText('Unauthorized')).toBeInTheDocument();
  });

  it('handles non-array API response for users gracefully', async () => {
    userAPI.getAllUsers.mockResolvedValue({ data: null });
    renderDiscover();
    expect(await screen.findByText('No developers found.')).toBeInTheDocument();
  });
});
