import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userAPI } from '../services/api';

const ProfileForm = ({ initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    website: initialData?.website || '',
    github: initialData?.github || '',
    linkedin: initialData?.linkedin || '',
    twitter: initialData?.twitter || '',
    skills: initialData?.skills || [],
    interests: initialData?.interests || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.split(',').map((item) => item.trim()),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userAPI.updateProfile(initialData._id, formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${initialData._id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="netflix-form">
      {error && <div className="netflix-alert">{error}</div>}
      {success && <div className="netflix-alert netflix-success">{success}</div>}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="netflix-form-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="netflix-input w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="netflix-form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="netflix-input w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="netflix-form-label">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="location" className="netflix-form-label">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="website" className="netflix-form-label">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="github" className="netflix-form-label">
            GitHub
          </label>
          <input
            type="url"
            id="github"
            name="github"
            value={formData.github}
            onChange={handleChange}
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="linkedin" className="netflix-form-label">
            LinkedIn
          </label>
          <input
            type="url"
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="twitter" className="netflix-form-label">
            Twitter
          </label>
          <input
            type="url"
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="skills" className="netflix-form-label">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills.join(', ')}
            onChange={handleArrayChange}
            className="netflix-input w-full"
          />
        </div>

        <div>
          <label htmlFor="interests" className="netflix-form-label">
            Interests (comma-separated)
          </label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests.join(', ')}
            onChange={handleArrayChange}
            className="netflix-input w-full"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/profile/${initialData._id}`)}
            className="netflix-link px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="netflix-button"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm; 