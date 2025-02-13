import React, { useState, useEffect } from 'react';
import './ProjectsGrid.css';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import UpdatesModal from './UpdatesModal';
import DevProcessModal from './DevProcessModal';
import { auth } from '../firebase';

const ProjectCard = ({ project, onClick }) => (
  <div className="project-card" onClick={() => onClick(project)}>
    <h3>{project.name}</h3>
    <p className="project-description">{project.description.substring(0, 100)}...</p>
    <div className="project-tech">
      <small>{project.techStack.split(',')[0]}</small>
    </div>
  </div>
);

const CreatorProfile = ({ userId, userName, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'userProfiles', userId));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (!profile && !loading) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content creator-profile-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2>Creator Profile</h2>
        <h3 className="creator-name">{userName}</h3>
        
        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : (
          <>
            <div className="profile-section">
              <h4>Class</h4>
              <p>{profile.class}</p>
            </div>

            <div className="profile-section">
              <h4>Major</h4>
              <p>{profile.major}</p>
            </div>

            <div className="profile-section">
              <h4>Bio</h4>
              <p>{profile.bio}</p>
            </div>

            {profile.linkedinUrl && (
              <a 
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-link"
              >
                View LinkedIn Profile
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ProjectModal = ({ project, onClose }) => {
  const [showCreatorProfile, setShowCreatorProfile] = useState(false);
  const [showDevUpdates, setShowDevUpdates] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjectComments();
  }, []);

  const loadProjectComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, 'projects', project.id, 'comments'),
        orderBy('timestamp', 'desc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!auth.currentUser) {
      setError('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const commentData = {
        content: newComment.trim(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'projects', project.id, 'comments'), commentData);
      await loadProjectComments();
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!auth.currentUser) return;
    
    try {
      setCommentLoading(true);
      await deleteDoc(doc(db, 'projects', project.id, 'comments', commentId));
      await loadProjectComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
    setCommentLoading(false);
  };

  if (!project) return null;

  // Function to extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(project.youtubeUrl);

  return (
    <div className="modal-overlay">
      <div className="modal-content project-details-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="project-header">
          <h2>{project.name}</h2>
          <p className="creator-info">
            Created by{' '}
            <button 
              className="creator-name-button"
              onClick={() => setShowCreatorProfile(true)}
            >
              {project.userName}
            </button>
          </p>
          <p className="project-date">
            Submitted on {new Date(project.submittedAt).toLocaleDateString()}
          </p>
        </div>

        {/* YouTube Video Embed */}
        <div className="video-container">
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Project Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="project-section">
          <h3>Description</h3>
          <p>{project.description}</p>
        </div>

        <div className="project-section">
          <h3>Motivation</h3>
          <p>{project.motivation}</p>
        </div>

        <div className="project-section">
          <h3>Tech Stack</h3>
          <p>{project.techStack}</p>
        </div>

        <div className="project-links">
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
            View Code
          </a>
          <button 
            className="project-link dev-process-link"
            onClick={() => setShowDevUpdates(true)}
          >
            View Dev Process
          </button>
        </div>

        <div className="project-comments-section">
          <h3>Comments</h3>
          {error && <p className="error-message">{error}</p>}
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.userName}</span>
                  <div className="comment-actions">
                    <span className="comment-date">
                      {comment.timestamp?.toLocaleDateString()}
                    </span>
                    {auth.currentUser?.uid === comment.userId && (
                      <button 
                        className="delete-comment-button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={commentLoading}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
          
          {auth.currentUser && (
            <div className="add-comment">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment about this project..."
                rows="2"
              />
              <button 
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreatorProfile && (
        <CreatorProfile
          userId={project.userId}
          userName={project.userName}
          onClose={() => setShowCreatorProfile(false)}
        />
      )}

      {showDevUpdates && (
        <DevProcessModal 
          isOpen={showDevUpdates}
          onClose={() => setShowDevUpdates(false)}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </div>
  );
};

const ProjectsGrid = ({ selectedClass }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('class', '==', selectedClass)
        );
        
        const querySnapshot = await getDocs(projectsQuery);
        const projectsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProjects(projectsList);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
      setLoading(false);
    };

    if (selectedClass) {
      loadProjects();
    }
  }, [selectedClass]);

  if (!selectedClass) return null;

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  return (
    <div className="projects-container">
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-content" onClick={() => handleProjectClick(project)}>
              <h3>{project.name}</h3>
              <p className="project-description">{project.description.substring(0, 100)}...</p>
              <div className="project-tech">
                <small>{project.techStack.split(',')[0]}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default ProjectsGrid; 