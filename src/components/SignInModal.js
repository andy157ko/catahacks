import React, { useState } from 'react';
import './SignInModal.css';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const SignInModal = ({ isOpen, onClose }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    authCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateAuthCode = async (code) => {
    try {
      const codeRef = doc(db, 'authCodes', code);
      const codeDoc = await getDoc(codeRef);
      
      if (codeDoc.exists()) {
        // Delete the code after use
        await deleteDoc(codeRef);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating code:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Validate auth code first
        const isValidCode = await validateAuthCode(formData.authCode);
        if (!isValidCode) {
          throw new Error('Invalid authentication code');
        }

        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: `${formData.firstName} ${formData.lastName}`
        });
      }
      onClose();
    } catch (err) {
      setError(
        err.message === 'Invalid authentication code'
          ? 'Invalid authentication code. Please contact administrator.'
          : err.message === 'Passwords do not match'
          ? 'Passwords do not match. Please try again.'
          : isSignIn
          ? 'Failed to sign in. Please check your credentials.'
          : 'Failed to create account. Please try again.'
      );
      console.error('Auth error:', err);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
          {error && <p className="error-message">{error}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="authCode"
                  placeholder="Authentication Code"
                  value={formData.authCode}
                  onChange={handleChange}
                  required={!isSignIn}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required={!isSignIn}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required={!isSignIn}
                  disabled={loading}
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {!isSignIn && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isSignIn}
                disabled={loading}
              />
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (isSignIn ? 'Signing In...' : 'Signing Up...') : 
                      (isSignIn ? 'Sign In' : 'Sign Up')}
          </button>

          <p className="toggle-auth">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              className="toggle-button"
              onClick={() => setIsSignIn(!isSignIn)}
            >
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignInModal; 