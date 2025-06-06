import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const projectRes = await projectAPI.getProject(id);
        setProject(projectRes.data);
        if (projectRes.data && projectRes.data.creator) {
          const creatorRes = await userAPI.getProfile(projectRes.data.creator);
          setCreator(creatorRes.data);
        } else {
          setCreator(null);
        }
      } catch (err) {
        setError('Failed to fetch project or creator');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectAPI.deleteProject(id);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Project not found</h2>
          <p className="mt-2 text-gray-500">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === project.creator;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="mt-2 text-gray-500">{project.description}</p>
            </div>
            {isOwner && (
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Link
                  to={`/projects/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Edit Project
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Technology Stack</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {project.githubUrl && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">GitHub Repository</h3>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-primary-600 hover:text-primary-500"
                >
                  {project.githubUrl}
                </a>
              </div>
            )}
            {project.liveUrl && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Live Demo</h3>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-primary-600 hover:text-primary-500"
                >
                  {project.liveUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creator Profile */}
      {creator && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Creator</h2>
            <div className="mt-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-medium">
                {creator.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link
                    to={`/profile/${creator._id}`}
                    className="hover:text-primary-600"
                  >
                    {creator.name}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500">{creator.email}</p>
              </div>
            </div>
            {creator.skills && creator.skills.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {creator.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 