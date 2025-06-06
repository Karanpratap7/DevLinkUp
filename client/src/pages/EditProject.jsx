import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import ProjectForm from '../components/ProjectForm';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await projectAPI.getProject(id);
        setProject(response.data);
      } catch (err) {
        setError('Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-netflix-black">
        <div className="netflix-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-netflix-black">
        <div className="bg-red-900/50 text-red-200 p-4 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-netflix-black">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-netflix-white mb-3">Project not found</h2>
          <p className="mt-2 text-netflix-light-gray">
            The project you're trying to edit doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-netflix-white sm:text-3xl sm:truncate">
            Edit Project
          </h2>
        </div>
      </div>

      <div className="bg-netflix-dark-gray shadow rounded-lg p-6">
        <ProjectForm initialData={project} />
      </div>
    </div>
  );
} 