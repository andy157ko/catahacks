import React, { useState, useEffect } from 'react';
import './ProfileModal.css';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ProfileModal = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState({
    class: '',
    major: '',
    bio: '',
    linkedinUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const profileDoc = await getDoc(doc(db, 'userProfiles', auth.currentUser.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setDoc(doc(db, 'userProfiles', auth.currentUser.uid), profile);
      onClose();
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>My Profile</h2>
          {error && <p className="error-message">{error}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>LinkedIn Profile URL</label>
            <input
              type="url"
              name="linkedinUrl"
              value={profile.linkedinUrl}
              onChange={handleChange}
              placeholder="e.g., https://linkedin.com/in/yourprofile"
              pattern="https?:\/\/(www\.)?linkedin\.com\/in\/.*"
              title="Please enter a valid LinkedIn profile URL"
            />
          </div>

          <div className="form-group">
            <label>Graduating Class</label>
            <input
              type="text"
              name="class"
              value={profile.class}
              onChange={handleChange}
              placeholder="e.g., 2025"
              required
            />
          </div>

          <div className="form-group">
            <label>Major</label>
            <input
              type="text"
              name="major"
              value={profile.major}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal; 