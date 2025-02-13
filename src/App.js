import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ideBackground from './ide-background.jpg'; // Add your IDE screenshot/gif here
import { AuthProvider } from './contexts/AuthContext';
import './utils/adminTools';  // Add this import
import { useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClassProjects from './components/ClassProjects';

// Create a new component for the welcome message
const WelcomeMessage = () => {
  const { currentUser } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const welcomeText = 'WELCOME';
  const nameText = currentUser ? ` ${currentUser.displayName?.split(' ')[0].toUpperCase() || ''}` : '';
  const fullText = currentUser ? welcomeText + nameText : 'CATAHACKS';

  useEffect(() => {
    if (currentUser) {
      setIsTyping(true);
      setDisplayText('W');
      let index = 1;
      
      const typeText = () => {
        if (index < fullText.length) {
          setDisplayText(prev => prev + fullText.charAt(index));
          index++;
          setTimeout(typeText, 100);
        } else {
          setIsTyping(false);
        }
      };

      setTimeout(typeText, 100);
    } else {
      setDisplayText('CATAHACKS');
      setIsTyping(false);
    }
  }, [currentUser, fullText]);

  // Split the text to add a special class to the last character
  const renderText = () => {
    if (!currentUser || !isTyping) return fullText;
    
    if (displayText.length > welcomeText.length) {
      const mainText = displayText.slice(0, -1);
      const lastChar = displayText.slice(-1);
      return (
        <>
          {mainText}
          <span className="glitch-char">{lastChar}</span>
        </>
      );
    }
    
    return displayText;
  };

  return (
    <h1 
      data-text={isTyping ? displayText : fullText}
      className={isTyping ? 'typing' : ''}
    >
      {renderText()}
    </h1>
  );
};

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <div 
            className="flashlight-background"
            style={{
              backgroundImage: `url(${ideBackground})`,
              maskImage: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`
            }}
          />
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <WelcomeMessage />
                <div className="glitch-block"></div>
                <div className="glitch-block"></div>
                <div className="glitch-block"></div>
                <div className="glitch-block"></div>
                <div className="glitch-block"></div>
                <div className="glitch-block"></div>
              </>
            } />
            <Route path="/class/:classCode" element={
              <ClassProjects />
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
