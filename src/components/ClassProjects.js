import React from 'react';
import './ClassProjects.css';
import ProjectsGrid from './ProjectsGrid';
import { useNavigate, useParams } from 'react-router-dom';
import UpdatesModal from './UpdatesModal';

const ClassProjects = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [showUpdates, setShowUpdates] = React.useState(false);

  return (
    <div className="class-projects-page">
      <div className="class-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="class-title" data-text={`${classCode} Class Projects`}>
          {classCode} Class Projects
        </h1>
      </div>
      <ProjectsGrid selectedClass={classCode} />
      {showUpdates && (
        <UpdatesModal 
          isOpen={showUpdates} 
          onClose={() => setShowUpdates(false)}
        />
      )}
    </div>
  );
};

export default ClassProjects; 