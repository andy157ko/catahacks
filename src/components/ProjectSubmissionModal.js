import React, { useState, useEffect } from 'react';
import './ProjectSubmissionModal.css';
import { auth, db } from '../firebase';
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';

const ProjectSubmissionModal = ({ isOpen, onClose }) => {
  const [project, setProject] = useState({
    name: '',
    description: '',
    motivation: '',
    techStack: '',
    youtubeUrl: '',
    githubUrl: '',
    submittedAt: '',
    class: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const validateUrls = () => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+$/;
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.+\/.+$/;

    if (!youtubeRegex.test(project.youtubeUrl)) {
      setError('Please enter a valid YouTube URL');
      return false;
    }
    if (!githubRegex.test(project.githubUrl)) {
      setError('Please enter a valid GitHub repository URL');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUrls()) return;

    setLoading(true);
    setError('');
    setSubmitStatus('submitting');

    try {
      const projectData = {
        ...project,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        submittedAt: new Date().toISOString()
      };

      const projectsRef = collection(db, 'projects');
      await addDoc(projectsRef, projectData);
      
      setSubmitStatus('success');
      setProject({
        name: '',
        description: '',
        motivation: '',
        techStack: '',
        youtubeUrl: '',
        githubUrl: '',
        class: ''
      });
      
      setTimeout(() => {
        onClose();
        setSubmitStatus('');
      }, 1500);

    } catch (err) {
      setError('Failed to submit project');
      console.error('Error submitting project:', err);
      setSubmitStatus('error');
    }

    setLoading(false);
  };

  const availableClasses = ['F24', 'S25'];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content project-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Submit Your Project</h2>
          {error && <p className="error-message">{error}</p>}
          {submitStatus === 'success' && (
            <p className="success-message">Project submitted successfully!</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label>Class</label>
            <select
              name="class"
              value={project.class}
              onChange={handleChange}
              required
              className="class-select"
            >
              <option value="">Select a class</option>
              {availableClasses.map(classOption => (
                <option key={classOption} value={classOption}>
                  {classOption}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              value={project.name}
              onChange={handleChange}
              placeholder="Enter your project name"
              required
            />
          </div>

          <div className="form-group">
            <label>What does it do?</label>
            <textarea
              name="description"
              value={project.description}
              onChange={handleChange}
              placeholder="Describe your project's functionality..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Why did you build it?</label>
            <textarea
              name="motivation"
              value={project.motivation}
              onChange={handleChange}
              placeholder="What inspired you to create this project?"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Tech Stack</label>
            <textarea
              name="techStack"
              value={project.techStack}
              onChange={handleChange}
              placeholder="List the technologies you used (e.g., React, Firebase, Node.js)"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>YouTube Demo Link</label>
            <input
              type="url"
              name="youtubeUrl"
              value={project.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div className="form-group">
            <label>GitHub Repository</label>
            <input
              type="url"
              name="githubUrl"
              value={project.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repository"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`submit-button ${submitStatus === 'submitting' ? 'submitting' : ''}`}
            disabled={loading || submitStatus === 'submitting'}
          >
            {submitStatus === 'submitting' ? 'Submitting...' : 
             submitStatus === 'success' ? 'Submitted!' : 
             'Submit Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectSubmissionModal; 