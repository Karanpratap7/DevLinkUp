import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../services/api';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!currentUser?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await projectAPI.getUserProjects(currentUser._id);
        setProjects(response.data);
      } catch (error) {
        setError('Failed to fetch projects');
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [currentUser?._id]);

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectAPI.deleteProject(projectId);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project._id !== projectId)
      );
    } catch (error) {
      setError('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-netflix-white">Please log in to view your dashboard</h2>
          <Link to="/login" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-netflix-white bg-netflix-red hover:bg-red-700">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black text-netflix-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-netflix-white">Dashboard</h1>
            <p className="mt-2 text-netflix-light-gray">
              Manage your projects and track your progress
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-netflix-white bg-netflix-red hover:bg-red-700"
            >
              Create New Project
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-900/50 p-4">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-netflix-white mb-6">Your Projects</h2>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-netflix-dark-gray rounded-lg">
              <p className="text-netflix-light-gray">You haven't created any projects yet.</p>
              <Link
                to="/projects/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-netflix-white bg-netflix-red hover:bg-red-700"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project._id} className="bg-netflix-dark-gray rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-netflix-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-netflix-light-gray mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-netflix-red/20 text-netflix-red"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-netflix-red hover:text-red-400 font-medium transition-colors duration-200"
                      >
                        View Project →
                      </Link>
                      <div className="flex space-x-3">
                        <Link
                          to={`/projects/${project._id}/edit`}
                          className="text-netflix-light-gray hover:text-netflix-white transition-colors duration-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 