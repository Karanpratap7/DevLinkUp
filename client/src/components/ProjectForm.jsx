import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';

export default function ProjectForm({ projectId, initialData }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [],
    githubUrl: '',
    liveDemoUrl: '',
  });
  const [newTech, setNewTech] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        techStack: Array.isArray(initialData.techStack) ? initialData.techStack : [],
        githubUrl: initialData.githubUrl || '',
        liveDemoUrl: initialData.liveDemoUrl || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTech = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()],
      }));
      setNewTech('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((tech) => tech !== techToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (projectId) {
        await projectAPI.updateProject(projectId, formData);
      } else {
        await projectAPI.createProject(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-netflix-dark-gray rounded-lg p-6">
        <h2 className="text-2xl font-bold text-netflix-white mb-6">
          {projectId ? 'Edit Project' : 'Add New Project'}
        </h2>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-netflix-light-gray">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full rounded-md border-netflix-light-gray shadow-sm focus:border-netflix-red focus:ring-netflix-red bg-netflix-black text-netflix-white sm:text-sm"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-netflix-light-gray">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              required
              className="mt-1 block w-full rounded-md border-netflix-light-gray shadow-sm focus:border-netflix-red focus:ring-netflix-red bg-netflix-black text-netflix-white sm:text-sm"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="techStack" className="block text-sm font-medium text-netflix-light-gray">
              Technology Stack
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={newTech || ''}
                onChange={(e) => setNewTech(e.target.value)}
                className="block w-full rounded-none rounded-l-md border-netflix-light-gray focus:border-netflix-red focus:ring-netflix-red bg-netflix-black text-netflix-white sm:text-sm"
                placeholder="Add a technology"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-netflix-white bg-netflix-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-netflix-red"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(formData.techStack) && formData.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-netflix-red/20 text-netflix-red"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-1 inline-flex items-center p-0.5 rounded-full text-netflix-red hover:bg-netflix-red/30 hover:text-netflix-white focus:outline-none"
                  >
                    <span className="sr-only">Remove {tech}</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-netflix-light-gray">
              GitHub URL
            </label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              required
              className="mt-1 block w-full rounded-md border-netflix-light-gray shadow-sm focus:border-netflix-red focus:ring-netflix-red bg-netflix-black text-netflix-white sm:text-sm"
              value={formData.githubUrl}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="liveDemoUrl" className="block text-sm font-medium text-netflix-light-gray">
              Live Demo URL
            </label>
            <input
              type="url"
              id="liveDemoUrl"
              name="liveDemoUrl"
              className="mt-1 block w-full rounded-md border-netflix-light-gray shadow-sm focus:border-netflix-red focus:ring-netflix-red bg-netflix-black text-netflix-white sm:text-sm"
              value={formData.liveDemoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-netflix-white bg-netflix-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : projectId ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 