import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';

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

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth = () => ({ currentUser: null, logout: vi.fn() });
  });

  describe('when user is logged out', () => {
    it('renders the DevLinkUp brand logo', () => {
      renderNavbar();
      expect(screen.getByText('DevLinkUp')).toBeInTheDocument();
    });

    it('shows Login link', () => {
      renderNavbar();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('shows Sign Up link', () => {
      renderNavbar();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('shows Discover link', () => {
      renderNavbar();
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('does not show Dashboard when logged out', () => {
      renderNavbar();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('does not show Logout button when logged out', () => {
      renderNavbar();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      mockUseAuth = () => ({
        currentUser: { _id: 'user1', name: 'Alice', email: 'alice@example.com' },
        logout: vi.fn(),
      });
    });

    it('shows the user name as a profile link', () => {
      renderNavbar();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('shows Logout button', () => {
      renderNavbar();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('shows Dashboard link', () => {
      renderNavbar();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('does not show Login link when logged in', () => {
      renderNavbar();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('profile link points to current user profile', () => {
      renderNavbar();
      const profileLink = screen.getByText('Alice').closest('a');
      expect(profileLink).toHaveAttribute('href', '/profile/user1');
    });

    it('calls logout and navigates to /login when Logout clicked', async () => {
      const mockLogout = vi.fn();
      mockUseAuth = () => ({
        currentUser: { _id: 'user1', name: 'Alice' },
        logout: mockLogout,
      });
      renderNavbar();
      fireEvent.click(screen.getByText('Logout'));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
