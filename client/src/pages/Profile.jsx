import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI, projectAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Debug output
    // eslint-disable-next-line no-console
    console.log('[Profile] useEffect', { 
      id, 
      currentUser, 
      authLoading,
      hasToken: !!localStorage.getItem('token'),
      currentUserId: currentUser?._id 
    });
    const fetchProfileAndProjects = async () => {
      if (authLoading) {
        // eslint-disable-next-line no-console
        console.log('[Profile] authLoading true, returning');
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Wait for auth to be ready
        if (!currentUser && !id) {
          // eslint-disable-next-line no-console
          console.log('[Profile] No currentUser and no id, waiting for auth...');
          return;
        }
        const userId = id || currentUser?._id;
        // eslint-disable-next-line no-console
        console.log('[Profile] Attempting to fetch with userId:', userId);
        if (!userId) {
          // eslint-disable-next-line no-console
          console.log('[Profile] No userId available. Current state:', {
            id,
            currentUser,
            authLoading,
            hasToken: !!localStorage.getItem('token')
          });
          setError('Please log in to view your profile or provide a valid user ID');
          setLoading(false);
          return;
        }
        // eslint-disable-next-line no-console
        console.log('[Profile] Fetching user', userId);
        const profileRes = await userAPI.getUser(userId);
        // eslint-disable-next-line no-console
        console.log('[Profile] profileRes', profileRes);
        if (!profileRes.data) {
          throw new Error('No profile data received');
        }
        setProfile(profileRes.data);
        try {
          // eslint-disable-next-line no-console
          console.log('[Profile] Fetching projects for', userId);
          const projectsRes = await projectAPI.getUserProjects(userId);
          // eslint-disable-next-line no-console
          console.log('[Profile] projectsRes', projectsRes);
          setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
        } catch (projectsErr) {
          // eslint-disable-next-line no-console
          console.error('[Profile] Error fetching projects:', projectsErr);
          setProjects([]);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Profile] Error fetching profile data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch profile or projects');
        setProfile(null);
        setProjects([]);
      } finally {
        setLoading(false);
        // eslint-disable-next-line no-console
        console.log('[Profile] setLoading(false)');
      }
    };
    fetchProfileAndProjects();
  }, [id, currentUser, authLoading, navigate]);

  // Show loading state while auth is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-900/50 p-4">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-netflix-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-netflix-white">Profile not found</h2>
            <p className="mt-2 text-netflix-light-gray">
              The developer profile you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === (id || currentUser._id);

  return (
    <div className="min-h-screen bg-netflix-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-netflix-dark-gray shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-netflix-red flex items-center justify-center text-netflix-white text-2xl font-medium">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-netflix-white">{profile.name}</h1>
                <p className="text-netflix-light-gray">{profile.email}</p>
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-netflix-white bg-netflix-red hover:bg-red-700"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-netflix-white">About</h3>
                <p className="mt-2 text-netflix-light-gray">{profile.bio}</p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-netflix-white">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-netflix-red/20 text-netflix-red"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-semibold text-netflix-white">Projects</h2>
              <p className="mt-2 text-sm text-netflix-light-gray">
                A list of all projects created by {profile.name}
              </p>
            </div>
            {isOwnProfile && (
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <Link
                  to="/projects/new"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-netflix-white bg-netflix-red hover:bg-red-700"
                >
                  Add Project
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-netflix-dark-gray rounded-lg">
                <p className="text-netflix-light-gray">No projects found</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project._id} className="bg-netflix-dark-gray rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-netflix-white">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-netflix-light-gray line-clamp-2">{project.description}</p>
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-netflix-red/20 text-netflix-red"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-netflix-red hover:text-red-400 font-medium transition-colors duration-200"
                      >
                        View Project →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 