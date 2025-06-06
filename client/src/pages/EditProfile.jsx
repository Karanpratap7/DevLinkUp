import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import ProfileForm from '../components/ProfileForm';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?._id) {
        setError('No user ID available');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        console.log('[EditProfile] Fetching profile for user:', currentUser._id);
        const response = await userAPI.getProfile(currentUser._id);
        console.log('[EditProfile] Profile data received:', response.data);
        setProfile(response.data);
      } catch (err) {
        console.error('[EditProfile] Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen netflix-bg">
        <div className="netflix-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 netflix-bg">
        <div className="netflix-alert">
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 netflix-bg">
        <div className="text-center">
          <h2 className="netflix-title text-2xl">Profile not found</h2>
          <p className="netflix-subtitle mt-2">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 netflix-bg">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="netflix-title text-2xl sm:text-3xl">
            Edit Profile
          </h2>
        </div>
      </div>

      <div className="mt-8 netflix-card rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ProfileForm initialData={profile} />
        </div>
      </div>
    </div>
  );
} 