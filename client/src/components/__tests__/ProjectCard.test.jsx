import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from '../ProjectCard';

const renderCard = (project) =>
  render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>
  );

describe('ProjectCard', () => {
  const baseProject = {
    _id: 'proj1',
    title: 'Awesome App',
    description: 'A really cool project',
    techStack: ['React', 'MongoDB'],
  };

  it('renders project title', () => {
    renderCard(baseProject);
    expect(screen.getByText('Awesome App')).toBeInTheDocument();
  });

  it('renders project description', () => {
    renderCard(baseProject);
    expect(screen.getByText('A really cool project')).toBeInTheDocument();
  });

  it('renders all tech stack badges', () => {
    renderCard(baseProject);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('links to the project detail page', () => {
    renderCard(baseProject);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/proj1');
  });

  it('shows first letter of title as placeholder image', () => {
    renderCard(baseProject);
    // First char of "Awesome App" is "A"
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows "No description provided." when description is absent', () => {
    renderCard({ ...baseProject, description: undefined });
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('does not render tech stack section when techStack is empty', () => {
    renderCard({ ...baseProject, techStack: [] });
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('does not render tech stack section when techStack is absent', () => {
    renderCard({ ...baseProject, techStack: undefined });
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });
});
