import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileForm from '../ProfileForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/api', () => ({
  userAPI: {
    updateProfile: vi.fn(),
  },
}));

const { userAPI } = await import('../../services/api');

const defaultInitial = {
  _id: 'user1',
  name: 'Alice',
  email: 'alice@example.com',
  bio: 'Developer',
  location: 'SF',
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  skills: ['React'],
  interests: ['OSS'],
};

const renderForm = (initialData = defaultInitial) =>
  render(
    <MemoryRouter>
      <ProfileForm initialData={initialData} />
    </MemoryRouter>
  );

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userAPI.updateProfile.mockResolvedValue({ data: defaultInitial });
  });

  it('pre-fills form fields from initialData', () => {
    renderForm();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Developer')).toBeInTheDocument();
  });

  it('renders skills as comma-separated string', () => {
    renderForm();
    expect(screen.getByDisplayValue('React')).toBeInTheDocument();
  });

  it('renders interests as comma-separated string', () => {
    renderForm();
    expect(screen.getByDisplayValue('OSS')).toBeInTheDocument();
  });

  it('shows "Saving..." when form is submitting', async () => {
    userAPI.updateProfile.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 200))
    );
    renderForm();
    fireEvent.submit(screen.getByRole('button', { name: /save changes/i }).closest('form'));
    expect(await screen.findByText('Saving...')).toBeInTheDocument();
  });

  it('shows success message after successful save', async () => {
    renderForm();
    fireEvent.submit(screen.getByRole('button', { name: /save changes/i }).closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    userAPI.updateProfile.mockRejectedValue({
      response: { data: { message: 'Update failed' } },
    });
    renderForm();
    fireEvent.submit(screen.getByRole('button', { name: /save changes/i }).closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('shows generic error message when no API error message present', async () => {
    userAPI.updateProfile.mockRejectedValue(new Error('Network error'));
    renderForm();
    fireEvent.submit(screen.getByRole('button', { name: /save changes/i }).closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });

  it('updates name field when user types', () => {
    renderForm();
    const nameInput = screen.getByDisplayValue('Alice');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Bob' } });
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
  });

  it('parses comma-separated skills on change', () => {
    renderForm();
    const skillsInput = screen.getByDisplayValue('React');
    fireEvent.change(skillsInput, {
      target: { name: 'skills', value: 'React, TypeScript, Node.js' },
    });
    // Re-joining: React, TypeScript, Node.js
    expect(screen.getByDisplayValue('React, TypeScript, Node.js')).toBeInTheDocument();
  });

  it('navigates back when Cancel is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile/user1');
  });

  it('works with no optional fields in initialData', () => {
    renderForm({ _id: 'u1', name: '', email: '' });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
