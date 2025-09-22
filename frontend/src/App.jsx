import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import LearnerProfileForm from './components/LearnerProfileForm';
import EditProfileForm from './components/EditProfileForm';
import JobRecommendations from './components/JobRecommendations';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import './components/Dashboard.css';

const AppContent = () => {
  const { user, login, logout } = useAuth();

  return (
    <div className="App">
      <Navbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          user ? <Navigate to="/profile" replace /> : <LoginForm onLogin={login} />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/profile" replace /> : <SignupForm onSignup={login} />
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileManager />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfileManager />
          </ProtectedRoute>
        } />
        <Route path="/job-recommendations" element={
          <ProtectedRoute>
            <JobRecommendationsPage />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Edit Profile Manager Component - handles profile editing flow
const EditProfileManager = () => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/learners/user/${user._id}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentProfile(data.data);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (isLoadingProfile) {
    return (
      <div style={{ 
        padding: '120px 20px 40px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        textAlign: 'center' 
      }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      padding: '120px 20px 40px'
    }}>
      <EditProfileForm currentProfile={currentProfile} />
    </div>
  );
};

// Profile Manager Component - handles profile completion flow
const ProfileManager = () => {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        try {
          // Check if user has a completed profile using userId
          const response = await fetch(`http://localhost:5000/api/learners/user/${user._id}`);
          if (response.ok) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } catch (error) {
          console.log('No profile found:', error);
          setHasProfile(false);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };

    checkUserProfile();
  }, [user]);

  if (isLoadingProfile) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        padding: '120px 20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        padding: '120px 20px 40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <LearnerProfileForm />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      padding: '120px 20px 40px'
    }}>
      <DashboardPage />
    </div>
  );
};

// Job Recommendations Page Component
const JobRecommendationsPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '100px 0 40px'
    }}>
      <JobRecommendations />
    </div>
  );
};

// Dashboard for users with completed profiles
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="dashboard-container" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="dashboard-title" style={{ margin: 0 }}>
          Welcome to Your Dashboard, {user?.firstName}!
        </h1>
        <button 
          onClick={() => navigate('/edit-profile')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>
      
      <div className="dashboard-hero">
        <h2>Your Personalized Learning Journey</h2>
        <p>Your AI-powered learning path is being generated based on your profile.</p>
        <p style={{ opacity: '0.8' }}>
          Coming soon: Personalized course recommendations, skill assessments, and career guidance!
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📊 Profile Completion</h3>
          <p>Your profile is complete! You're ready to receive personalized recommendations.</p>
          <div style={{ marginTop: '15px' }}>
            <small style={{ color: '#667eea', fontWeight: '500' }}>
              ✨ Update your profile anytime to get better recommendations
            </small>
          </div>
        </div>
        
        <div className="dashboard-card" style={{ cursor: 'pointer' }} 
             onClick={() => navigate('/job-recommendations')}>
          <h3>💼 Job Recommendations</h3>
          <p>Discover personalized job opportunities matching your skills and aspirations.</p>
          <div style={{ marginTop: '15px' }}>
            <small style={{ color: '#667eea', fontWeight: '500' }}>
              🎯 AI-powered job matching with skill gap analysis
            </small>
          </div>
          <div style={{ 
            marginTop: '10px', 
            padding: '8px 16px', 
            background: '#667eea', 
            color: 'white', 
            borderRadius: '20px', 
            display: 'inline-block',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            View Jobs →
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>🎯 Learning Goals</h3>
          <p>AI is analyzing your aspirations to create your perfect learning path.</p>
          <div style={{ marginTop: '15px' }}>
            <small style={{ color: '#667eea', fontWeight: '500' }}>
              📈 Recommendations will refresh after profile updates
            </small>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>📚 Recommended Courses</h3>
          <p>Personalized course recommendations will appear here soon.</p>
          <div style={{ marginTop: '15px' }}>
            <small style={{ color: '#667eea', fontWeight: '500' }}>
              🔄 Based on your current profile data
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => (
  <div style={{ 
    position: 'fixed',
    top: '80px', // Account for navbar height
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: 'calc(100vh - 80px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    padding: '60px 20px 40px', // Increased top padding to clear navbar properly
    display: 'flex',
    alignItems: 'flex-start', // Changed from center to flex-start for proper spacing
    justifyContent: 'center',
    overflow: 'auto'
  }}>
    <div style={{ maxWidth: '1200px', color: 'white', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '30px', fontWeight: 'bold' }}>About LearnPath AI</h1>
        <p style={{ fontSize: '1.3rem', lineHeight: '1.8', marginBottom: '40px' }}>
          Revolutionizing education through AI-powered personalized learning experiences
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎯</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Our Mission</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            To democratize quality education by providing personalized learning paths that adapt to each learner's unique needs, aspirations, and circumstances.
          </p>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌟</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Our Vision</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            A world where every individual has access to personalized, AI-driven education that unlocks their full potential and creates meaningful career opportunities.
          </p>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Our Technology</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Advanced machine learning algorithms analyze learner profiles, market trends, and industry demands to create optimal learning pathways.
          </p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Why Choose LearnPath AI?</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>50K+</div>
            <p style={{ fontSize: '1.1rem' }}>Learners Guided</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>1000+</div>
            <p style={{ fontSize: '1.1rem' }}>Skill Pathways</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>95%</div>
            <p style={{ fontSize: '1.1rem' }}>Success Rate</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>24/7</div>
            <p style={{ fontSize: '1.1rem' }}>AI Support</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeaturesPage = () => (
  <div style={{ 
    position: 'fixed',
    top: '80px', // Account for navbar height
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: 'calc(100vh - 80px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    padding: '60px 20px 40px', // Increased top padding to clear navbar properly
    display: 'flex',
    alignItems: 'flex-start', // Changed from center to flex-start for proper spacing
    justifyContent: 'center',
    overflow: 'auto'
  }}>
    <div style={{ maxWidth: '1200px', color: 'white', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '30px', fontWeight: 'bold' }}>Powerful Features</h1>
        <p style={{ fontSize: '1.3rem', lineHeight: '1.8', marginBottom: '40px' }}>
          Discover all the innovative features that make LearnPath AI the ultimate learning companion
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🤖</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>AI-Powered Recommendations</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Our advanced machine learning algorithms analyze your profile, learning style, and career goals to provide personalized course recommendations.
          </p>
          <ul style={{ fontSize: '1rem', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>Real-time learning path optimization</li>
            <li>Adaptive content difficulty</li>
            <li>Skill gap analysis</li>
          </ul>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Comprehensive Profiling</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Deep analysis of your academic background, skills, preferences, and socio-economic factors for precise recommendations.
          </p>
          <ul style={{ fontSize: '1rem', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>Academic history tracking</li>
            <li>Skill assessment tools</li>
            <li>Learning preference analysis</li>
          </ul>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🎯</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>NSQF Alignment</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            All recommendations align with National Skills Qualifications Framework for industry recognition and career advancement.
          </p>
          <ul style={{ fontSize: '1rem', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>Industry-standard certifications</li>
            <li>Quality assurance framework</li>
            <li>Career pathway mapping</li>
          </ul>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>📈</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Market Intelligence</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Real-time labor market data and industry trends to ensure your learning path stays relevant and in-demand.
          </p>
          <ul style={{ fontSize: '1rem', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>Job market trend analysis</li>
            <li>Salary insights</li>
            <li>Industry demand forecasting</li>
          </ul>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🌐</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Multilingual Support</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Access learning content in multiple Indian languages, ensuring inclusive education for diverse backgrounds.
          </p>
          <ul style={{ fontSize: '1rem', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>10+ Indian languages</li>
            <li>Cultural context awareness</li>
            <li>Localized content delivery</li>
          </ul>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          padding: '40px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🔒</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Secure & Private</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Enterprise-grade security ensures your personal data and learning progress remain private and protected.
          </p>
          <ul style={{ fontSize: '1rem', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>End-to-end encryption</li>
            <li>GDPR compliant</li>
            <li>Secure data storage</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
