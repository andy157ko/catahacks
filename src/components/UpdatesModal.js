import React, { useState, useEffect, useCallback } from 'react';
import './UpdatesModal.css';
import { auth, db } from '../firebase';
import { collection, addDoc, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';

const UpdatesModal = ({ isOpen, onClose }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [projectNames, setProjectNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    challenges: ''
  });
  const [error, setError] = useState('');
  const [editingUpdate, setEditingUpdate] = useState(null);

  const loadProjectUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const updatesQuery = query(
        collection(db, 'updates'),
        where('projectId', '==', selectedProject),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      
      const updatesSnapshot = await getDocs(updatesQuery);
      const updatesData = updatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      setUpdates(updatesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading updates:', error);
      setError('Failed to load updates');
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      loadUserProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectUpdates();
    }
  }, [selectedProject, loadProjectUpdates]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', auth.currentUser.uid)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setProjectNames(projects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const target = editingUpdate ? 'editingUpdate' : 'newUpdate';
    const updateData = editingUpdate ? editingUpdate : newUpdate;
    
    const updatedData = {
      ...updateData,
      [e.target.name]: e.target.value
    };

    if (target === 'editingUpdate') {
      setEditingUpdate(updatedData);
    } else {
      setNewUpdate(updatedData);
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
  };

  const handleCancelEdit = () => {
    setEditingUpdate(null);
  };

  const handleUpdateEdit = async () => {
    try {
      setLoading(true);
      const updateRef = doc(db, 'updates', editingUpdate.id);
      await updateDoc(updateRef, {
        title: editingUpdate.title,
        content: editingUpdate.content,
        challenges: editingUpdate.challenges
      });
      
      await loadProjectUpdates();
      setEditingUpdate(null);
      setError('Update edited successfully!');
    } catch (err) {
      setError('Failed to edit update');
      console.error('Error editing update:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedProject) {
        setError('Please select a project');
        setLoading(false);
        return;
      }

      const updateData = {
        ...newUpdate,
        projectId: selectedProject,
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'updates'), updateData);
      await loadProjectUpdates();
      setNewUpdate({ title: '', content: '', challenges: '' });
      setError('Update posted successfully!');
    } catch (err) {
      setError('Failed to post update');
      console.error('Error posting update:', err);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content updates-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Development Updates</h2>
          {error && <p className={error.includes('successfully') ? 'success-message' : 'error-message'}>
            {error}
          </p>}
        </div>

        <div className="project-filter">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="project-select"
          >
            <option value="">Choose a project...</option>
            {projectNames.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <>
            <div className="updates-history">
              <h3>Update History</h3>
              {updates.map(update => (
                <div key={update.id} className="update-item">
                  {editingUpdate?.id === update.id ? (
                    <div className="edit-update-form">
                      <input
                        type="text"
                        name="title"
                        value={editingUpdate.title}
                        onChange={handleChange}
                        placeholder="Update title"
                      />
                      <textarea
                        name="content"
                        value={editingUpdate.content}
                        onChange={handleChange}
                        placeholder="Progress update"
                      />
                      <textarea
                        name="challenges"
                        value={editingUpdate.challenges}
                        onChange={handleChange}
                        placeholder="Challenges faced"
                      />
                      <div className="edit-buttons">
                        <button onClick={handleUpdateEdit}>Save Changes</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="update-header">
                        <h4>{update.title}</h4>
                        <button className="edit-button" onClick={() => handleEdit(update)}>
                          Edit
                        </button>
                      </div>
                      <p className="update-date">
                        {update.timestamp?.toLocaleDateString()}
                      </p>
                      <p className="update-content">{update.content}</p>
                      <p className="update-challenges">{update.challenges}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="update-form">
              <h3>Add New Update</h3>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={newUpdate.title}
                  onChange={handleChange}
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Progress Update</label>
                <textarea
                  name="content"
                  value={newUpdate.content}
                  onChange={handleChange}
                  placeholder="Describe what you accomplished..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Challenges</label>
                <textarea
                  name="challenges"
                  value={newUpdate.challenges}
                  onChange={handleChange}
                  placeholder="What challenges did you face?"
                  rows="4"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Update'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatesModal; 