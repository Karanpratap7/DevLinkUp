import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

// Mock the components that require authentication
vi.mock('../components/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }) {
    return children;
  };
});

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    currentUser: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('App', () => {
  const renderApp = () => {
    return render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  };

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the home page by default', () => {
    renderApp();
    expect(screen.getAllByText(/DevLinkUp/i).length).toBeGreaterThan(0);
  });

  it('renders the navigation links', () => {
    renderApp();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });
}); 