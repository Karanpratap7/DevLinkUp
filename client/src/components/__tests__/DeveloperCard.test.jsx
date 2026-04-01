import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DeveloperCard from '../DeveloperCard';

const renderCard = (developer) =>
  render(
    <MemoryRouter>
      <DeveloperCard developer={developer} />
    </MemoryRouter>
  );

describe('DeveloperCard', () => {
  const baseDev = {
    _id: 'dev1',
    name: 'Jane Doe',
    bio: 'Full stack developer',
    skills: ['React', 'Node.js'],
  };

  it('renders developer name', () => {
    renderCard(baseDev);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders developer bio', () => {
    renderCard(baseDev);
    expect(screen.getByText('Full stack developer')).toBeInTheDocument();
  });

  it('renders all skills as badges', () => {
    renderCard(baseDev);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('links to the developer profile page', () => {
    renderCard(baseDev);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile/dev1');
  });

  it('uses fallback avatar when no avatar prop is given', () => {
    renderCard(baseDev);
    const img = screen.getByAltText('Jane Doe');
    expect(img.src).toContain('ui-avatars.com');
  });

  it('uses provided avatar when given', () => {
    renderCard({ ...baseDev, avatar: 'https://example.com/avatar.png' });
    const img = screen.getByAltText('Jane Doe');
    expect(img.src).toBe('https://example.com/avatar.png');
  });

  it('shows "Developer" as default title when no title prop given', () => {
    renderCard(baseDev);
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('shows provided title', () => {
    renderCard({ ...baseDev, title: 'Backend Engineer' });
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
  });

  it('shows "No bio provided." when bio is empty', () => {
    renderCard({ ...baseDev, bio: '' });
    expect(screen.getByText('No bio provided.')).toBeInTheDocument();
  });

  it('renders with no skills gracefully', () => {
    renderCard({ ...baseDev, skills: undefined });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders with empty skills array', () => {
    renderCard({ ...baseDev, skills: [] });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});
