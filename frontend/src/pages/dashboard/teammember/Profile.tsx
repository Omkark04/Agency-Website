import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, type User } from '../../../api/users';
import api from '../../../api/api';
import { DigitalClock } from '../../../components/DigitalClock';
import '../admin/Profile.css';

interface Department {
  id: number;
  title: string;
}

interface TeamMemberProfile extends User {
  department_info?: Department;
  job_title?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<TeamMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setAvatarPreview(response.data.avatar_url || null);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar_url || null);
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', avatarFile);

        const uploadRes = await api.post('/api/upload/', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        avatarUrl = uploadRes.data.url;
      }

      await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      fetchProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      {message && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-main-section">
          <div className="profile-avatar-section">
            <div className="avatar-placeholder">
              {(avatarPreview || profile?.avatar_url) ? (
                <img src={avatarPreview || profile?.avatar_url} alt="Profile" />
              ) : (
                <div className="avatar-initials">
                  {profile?.first_name?.[0] || profile?.username?.[0] || 'T'}
                </div>
              )}
            </div>
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            
            <div className="avatar-actions">
              <label htmlFor="avatar-upload" className="btn-upload-avatar">
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
              
              {avatarPreview && avatarPreview !== profile?.avatar_url && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="btn-remove-avatar"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <DigitalClock className="profile-clock" />
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Account Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="input-disabled"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={profile?.department_info?.title || 'Not assigned'}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-group">
                <label>Job Title / Role</label>
                <input
                  type="text"
                  value={profile?.job_title || 'Not assigned'}
                  disabled
                  className="input-disabled"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
