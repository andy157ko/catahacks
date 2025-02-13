import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../catalystlogo.png';
import SignInModal from './SignInModal';
import ProfileModal from './ProfileModal';
import UpdatesModal from './UpdatesModal';
import ProjectSubmissionModal from './ProjectSubmissionModal';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ProjectsGrid from './ProjectsGrid';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsDropdownOpen(false);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClassSelect = (classCode) => {
    setIsDropdownOpen(false);
    window.open(`/class/${classCode}`, '_blank');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
        </div>
        
        <div className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-right ${isMenuOpen ? 'show' : ''}`}>
          <div className={`dropdown ${isDropdownOpen ? 'active' : ''}`}>
            <button className="dropdown-button" onClick={toggleDropdown}>
              Class <span className="dropdown-arrow">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-content">
                <a style={{ cursor: 'pointer' }} onClick={() => handleClassSelect('F24')}>F24</a>
                <a style={{ cursor: 'pointer' }} onClick={() => handleClassSelect('S25')}>S25</a>
              </div>
            )}
          </div>

          {currentUser && (
            <>
              <button 
                className="profile-button"
                onClick={() => setIsProfileModalOpen(true)}
              >
                My Profile
              </button>
              <button 
                className="profile-button"
                onClick={() => setIsUpdatesModalOpen(true)}
              >
                Updates
              </button>
              <button 
                className="publish-button"
                onClick={() => setIsProjectModalOpen(true)}
              >
                Publish
              </button>
            </>
          )}
          
          {currentUser ? (
            <div className="user-section">
              <span className="user-name">{currentUser.displayName}</span>
              <button className="sign-in-button" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="sign-in-button" onClick={() => setIsSignInModalOpen(true)}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      <ProjectsGrid selectedClass={selectedClass} />

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <UpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={() => setIsUpdatesModalOpen(false)}
      />

      <ProjectSubmissionModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
