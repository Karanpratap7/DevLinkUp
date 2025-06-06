import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await projectAPI.getAllProjects();
        if (!response.data) {
          throw new Error('No data received from server');
        }
        setFeaturedProjects(Array.isArray(response.data) ? response.data.slice(0, 3) : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load featured projects');
        setFeaturedProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-gradient-to-r from-zinc-800 to-zinc-700"></div>
          <div className="p-6">
            <div className="h-6 bg-zinc-700 rounded w-3/4 mb-3"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-zinc-700 rounded w-full"></div>
              <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-zinc-700 rounded-full w-16"></div>
              <div className="h-5 bg-zinc-700 rounded-full w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Netflix Style */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-20"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-20 w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            <span className="text-white">Dev</span>
            <span className="text-red-600">LinkUp</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            The ultimate platform for developers to connect, showcase projects, and build the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-sm font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/projects"
              className="group bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-sm font-semibold text-lg border border-zinc-600 transition-all duration-200 hover:scale-105"
            >
              Browse Projects
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Features Section - Netflix Tiles Style */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose DevLinkUp</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect & Collaborate",
                description: "Join thousands of developers building amazing projects together",
                icon: (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                title: "Showcase Your Work",
                description: "Display your projects with stunning portfolios that get noticed",
                icon: (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                title: "Premium Experience",
                description: "Enjoy a fast, modern platform built for developers by developers",
                icon: (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-zinc-900 hover:bg-zinc-800 p-8 rounded-lg transition-all duration-300 hover:scale-105 border border-zinc-800 hover:border-zinc-700">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Projects</h2>
              <p className="text-gray-400 text-lg">Trending now</p>
            </div>
            {Array.isArray(featuredProjects) && featuredProjects.length > 0 && (
              <Link
                to="/projects"
                className="text-red-600 hover:text-red-500 font-semibold text-lg transition-colors duration-200"
              >
                View All →
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(featuredProjects) && featuredProjects.length > 0 ? (
                featuredProjects.map((project, index) => (
                  <div 
                    key={project._id}
                    className="group bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-300 hover:scale-105 border border-zinc-800 hover:border-zinc-700"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Project Thumbnail/Header */}
                    <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            FEATURED
                          </span>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-gray-300 text-sm">4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-600 transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed overflow-hidden">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Array.isArray(project.techStack) && project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700 hover:border-red-600/50 transition-colors duration-200"
                          >
                            {tech}
                          </span>
                        ))}
                        {Array.isArray(project.techStack) && project.techStack.length > 3 && (
                          <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
                            +{project.techStack.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* View Project Link */}
                      <Link
                        to={`/projects/${project._id}`}
                        className="group/link inline-flex items-center text-red-600 hover:text-red-500 font-semibold transition-colors duration-200"
                      >
                        <span className="mr-2">▶</span>
                        View Project
                        <svg className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="mb-6">
                    <svg className="w-24 h-24 text-zinc-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Projects Available</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Be the first to showcase your project and inspire the developer community.
                  </p>
                  <Link
                    to="/projects/create"
                    className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Project
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}