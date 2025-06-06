import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, projectAPI } from '../services/api';
import DeveloperCard from '../components/DeveloperCard';
import ProjectCard from '../components/ProjectCard';

export default function Discover() {
  const [developers, setDevelopers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('developers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const commonSkills = [
    'JavaScript',
    'Python',
    'Java',
    'React',
    'Node.js',
    'TypeScript',
    'Docker',
    'AWS',
    'MongoDB',
    'SQL',
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('[Discover] Fetching data...');
        const [usersRes, projectsRes] = await Promise.all([
          userAPI.getAllUsers(),
          projectAPI.getAllProjects(),
        ]);
        console.log('[Discover] Data received:', { users: usersRes.data, projects: projectsRes.data });
        setDevelopers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      } catch (err) {
        console.error('[Discover] Error fetching data:', err);
        setError(
          err.response?.data?.message || 
          'Failed to fetch data. Please try again later.'
        );
        setDevelopers([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDevelopers = developers.filter((developer) => {
    const matchesSearch = developer.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => developer.skills?.includes(skill));
    return matchesSearch && matchesSkills;
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => project.techStack?.includes(skill));
    return matchesSearch && matchesSkills;
  });

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse border border-zinc-800">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-zinc-700 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-zinc-700 rounded w-full"></div>
              <div className="h-3 bg-zinc-700 rounded w-4/5"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-zinc-700 rounded-full w-16"></div>
              <div className="h-6 bg-zinc-700 rounded-full w-20"></div>
              <div className="h-6 bg-zinc-700 rounded-full w-14"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900/50 to-black"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-white">Discover</span>
            <span className="text-red-600"> Talent</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Connect with developers and explore innovative projects from our community
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          {/* Mobile Dropdown */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            >
              <option value="developers">Developers</option>
              <option value="projects">Projects</option>
            </select>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden sm:block">
            <div className="border-b border-zinc-800">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('developers')}
                  className={`${
                    activeTab === 'developers'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-zinc-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126.1283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Developers
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`${
                    activeTab === 'projects'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-zinc-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Projects
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200"
              />
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Filter by Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedSkills.includes(skill)
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {skill}
                  {selectedSkills.includes(skill) && (
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="mt-3 text-sm text-red-600 hover:text-red-500 font-medium transition-colors duration-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Loading and Results */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div>
            {activeTab === 'developers' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Developers</h2>
                {filteredDevelopers.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDevelopers.map((developer) => (
                      <DeveloperCard key={developer._id} developer={developer} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No developers found.</p>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Projects</h2>
                {filteredProjects.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No projects found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}