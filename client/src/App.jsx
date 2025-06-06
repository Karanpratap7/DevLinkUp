import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Discover = lazy(() => import('./pages/Discover'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EditProject = lazy(() => import('./pages/EditProject'));

import PrivateRoute from './components/PrivateRoute';
import ProjectForm from './components/ProjectForm'; // Assuming ProjectForm is also used outside of routes, might not need lazy loading

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-16">
            <Suspense fallback={<div>Loading...</div>}> {/* Add Suspense here */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/discover" element={<Discover />} />
                {/* Keep /projects route if it renders a component */} {/* Assuming /projects also renders Discover based on previous code */}
                 <Route path="/projects" element={<Discover />} />

                <Route path="/projects/new" element={
                  <PrivateRoute>
                    {/* If ProjectForm is large, lazy load it too */}
                    <ProjectForm /> 
                  </PrivateRoute>
                } />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/edit" element={
                  <PrivateRoute>
                    <EditProject />
                  </PrivateRoute>
                } />
                
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <PrivateRoute>
                      <EditProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
