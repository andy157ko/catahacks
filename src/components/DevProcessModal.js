import React, { useState, useEffect } from 'react';
import './UpdatesModal.css';  // We can reuse the styling
import { auth, db } from '../firebase';
import { collection, addDoc, query, getDocs, orderBy, where, serverTimestamp } from 'firebase/firestore';

const DevProcessModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjectUpdates();
      loadProjectComments();
    }
  }, [isOpen]);

  const loadProjectUpdates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load updates
      const updatesQuery = query(
        collection(db, 'updates'),
        where('projectId', '==', projectId),
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
      console.error('Error fetching project updates:', error);
      setError('Failed to load updates');
      setLoading(false);
    }
  };

  const loadProjectComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, 'projects', projectId, 'comments'),
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

      await addDoc(collection(db, 'projects', projectId, 'comments'), commentData);
      await loadProjectComments();
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
    setCommentLoading(false);
  };

  const handleUpdateClick = (update) => {
    setSelectedUpdate(update);
  };

  const handleBackToList = () => {
    setSelectedUpdate(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content updates-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>{projectName} - Development Journey</h2>
          {error && <p className="error-message">{error}</p>}
        </div>

        {selectedUpdate ? (
          <div className="update-detail-view">
            <button className="back-to-list" onClick={handleBackToList}>
              ← Back to Updates
            </button>
            <div className="update-detail-header">
              <h3>{selectedUpdate.title}</h3>
              <div className="update-meta">
                <span className="update-date">
                  {selectedUpdate.timestamp?.toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="update-detail-content">
              <section>
                <h4>Progress Update</h4>
                <p>{selectedUpdate.content}</p>
              </section>
              <section>
                <h4>Challenges</h4>
                <p>{selectedUpdate.challenges}</p>
              </section>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="loading">Loading development updates...</div>
            ) : (
              <>
                <div className="updates-list">
                  {updates.map(update => (
                    <div key={update.id} className="update-item">
                      <div className="update-header">
                        <span className="update-date">
                          {update.timestamp?.toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="update-title">{update.title}</h3>
                      <p className="update-preview">{update.content}</p>
                      <p className="update-challenges">{update.challenges}</p>
                    </div>
                  ))}
                  {updates.length === 0 && (
                    <p className="no-updates">No development updates available for this project.</p>
                  )}
                </div>

                <div className="project-comments-section">
                  <h3>Project Comments</h3>
                  <div className="comments-list">
                    {comments.map(comment => (
                      <div key={comment.id} className="comment">
                        <div className="comment-header">
                          <span className="comment-author">{comment.userName}</span>
                          <span className="comment-date">
                            {comment.timestamp?.toLocaleDateString()}
                          </span>
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DevProcessModal; 