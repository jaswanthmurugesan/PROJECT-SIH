import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobRecommendationAPI } from '../services/jobRecommendationAPI';
import './JobRecommendations.css';

const JobRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    limit: 10,
    industry: '',
    location: ''
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState(null);
  const [showSkillGap, setShowSkillGap] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchRecommendations();
    }
  }, [user, filters]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await jobRecommendationAPI.getRecommendations(user._id, filters);
      
      if (response.success) {
        setRecommendations(response.recommendations || []);
      } else {
        setError('Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Error loading job recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGapAnalysis = async (job) => {
    try {
      setSelectedJob(job);
      setShowSkillGap(true);
      
      const response = await jobRecommendationAPI.getSkillGapAnalysis(user._id, job._id);
      
      if (response.success) {
        setSkillGapAnalysis(response.analysis);
      } else {
        setError('Failed to analyze skill gap');
      }
    } catch (err) {
      console.error('Error analyzing skill gap:', err);
      setError('Error analyzing skill gap. Please try again.');
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    
    const { min, max, currency = 'INR', period = 'per month' } = salary;
    
    if (min && max) {
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()} ${period}`;
    } else if (min) {
      return `₹${min.toLocaleString()}+ ${period}`;
    }
    
    return 'Not specified';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#eab308'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="job-recommendations-loading">
        <div className="loading-spinner"></div>
        <h3>Finding perfect job matches for you...</h3>
        <p>Analyzing your profile against NCS job listings</p>
      </div>
    );
  }

  return (
    <div className="job-recommendations-container">
      <div className="recommendations-header">
        <h2>🎯 Personalized Job Recommendations</h2>
        <p>Based on your profile, skills, and career aspirations</p>
      </div>

      {/* Filters */}
      <div className="recommendations-filters">
        <div className="filter-group">
          <label>Industry:</label>
          <select 
            value={filters.industry} 
            onChange={(e) => handleFilterChange('industry', e.target.value)}
          >
            <option value="">All Industries</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Banking & Finance">Banking & Finance</option>
            <option value="Government">Government</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Location:</label>
          <input 
            type="text" 
            placeholder="City or State"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Results:</label>
          <select 
            value={filters.limit} 
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
          >
            <option value={5}>5 jobs</option>
            <option value={10}>10 jobs</option>
            <option value={20}>20 jobs</option>
            <option value={50}>50 jobs</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchRecommendations}>Retry</button>
        </div>
      )}

      {recommendations.length === 0 && !loading && (
        <div className="no-recommendations">
          <h3>No job recommendations found</h3>
          <p>Try adjusting your filters or complete your profile for better matches.</p>
        </div>
      )}

      {/* Job Recommendations List */}
      <div className="recommendations-list">
        {recommendations.map((job, index) => (
          <div key={job._id} className="job-card">
            <div className="job-card-header">
              <div className="job-title-company">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
              </div>
              <div className="match-score" style={{ backgroundColor: getMatchScoreColor(job.matchScore) }}>
                {job.matchScore}% Match
              </div>
            </div>

            <div className="job-details">
              <div className="job-info-grid">
                <div className="info-item">
                  <span className="label">📍 Location:</span>
                  <span className="value">
                    {job.location?.isRemote ? 'Remote' : 
                     `${job.location?.city || ''} ${job.location?.state || ''}`.trim() || 'Not specified'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="label">🏭 Industry:</span>
                  <span className="value">{job.industry || 'General'}</span>
                </div>
                
                <div className="info-item">
                  <span className="label">💰 Salary:</span>
                  <span className="value">{formatSalary(job.salary)}</span>
                </div>
                
                <div className="info-item">
                  <span className="label">📈 Experience:</span>
                  <span className="value">
                    {job.experienceRequired ? 
                     `${job.experienceRequired.min}-${job.experienceRequired.max} years` : 
                     'Any level'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="label">🎓 Education:</span>
                  <span className="value">{job.education?.minimumQualification || 'Not specified'}</span>
                </div>
                
                <div className="info-item">
                  <span className="label">⭐ NSQF Level:</span>
                  <span className="value">Level {job.nsqfLevel || 'Not specified'}</span>
                </div>
              </div>

              {/* Match Reasons */}
              {job.matchReasons && job.matchReasons.length > 0 && (
                <div className="match-reasons">
                  <h4>Why this job matches you:</h4>
                  <ul>
                    {job.matchReasons.map((reason, idx) => (
                      <li key={idx}>✅ {reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills */}
              {job.skills?.required && job.skills.required.length > 0 && (
                <div className="job-skills">
                  <h4>Required Skills:</h4>
                  <div className="skills-tags">
                    {job.skills.required.slice(0, 8).map((skill, idx) => (
                      <span 
                        key={idx} 
                        className={`skill-tag ${skill.importance.toLowerCase()}`}
                      >
                        {skill.skillName}
                        {skill.importance === 'Critical' && ' ⚡'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              {job.description && (
                <div className="job-description">
                  <h4>Job Description:</h4>
                  <p>{job.description.substring(0, 300)}...</p>
                </div>
              )}
            </div>

            <div className="job-card-actions">
              <button 
                className="btn-analyze-skills"
                onClick={() => handleSkillGapAnalysis(job)}
              >
                🔍 Analyze Skill Gap
              </button>
              
              {job.applicationDetails?.applyUrl && (
                <a 
                  href={job.applicationDetails.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-apply"
                >
                  Apply Now 🚀
                </a>
              )}
              
              <div className="job-meta">
                <small>Posted: {new Date(job.postedDate).toLocaleDateString()}</small>
                {job.applicationDetails?.applicationDeadline && (
                  <small className="deadline">
                    Deadline: {new Date(job.applicationDetails.applicationDeadline).toLocaleDateString()}
                  </small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Gap Analysis Modal */}
      {showSkillGap && selectedJob && (
        <div className="skill-gap-modal-overlay" onClick={() => setShowSkillGap(false)}>
          <div className="skill-gap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Skill Gap Analysis</h3>
              <button className="close-btn" onClick={() => setShowSkillGap(false)}>×</button>
            </div>
            
            {skillGapAnalysis ? (
              <div className="skill-gap-content">
                <div className="job-info">
                  <h4>{skillGapAnalysis.jobTitle}</h4>
                  <p>{skillGapAnalysis.company}</p>
                </div>
                
                <div className="overall-match">
                  <div className="match-circle" style={{ backgroundColor: getMatchScoreColor(skillGapAnalysis.overallSkillMatch) }}>
                    {skillGapAnalysis.overallSkillMatch}%
                  </div>
                  <p>Overall Skill Match</p>
                </div>
                
                <div className="skill-breakdown">
                  <div className="skill-stats">
                    <div className="stat">
                      <span className="number">{skillGapAnalysis.totalRequiredSkills}</span>
                      <span className="label">Total Required</span>
                    </div>
                    <div className="stat">
                      <span className="number">{skillGapAnalysis.matchingSkills?.length || 0}</span>
                      <span className="label">You Have</span>
                    </div>
                    <div className="stat">
                      <span className="number">{skillGapAnalysis.missingSkills?.length || 0}</span>
                      <span className="label">Missing</span>
                    </div>
                  </div>
                  
                  {skillGapAnalysis.matchingSkills?.length > 0 && (
                    <div className="skills-section">
                      <h5>✅ Skills You Have:</h5>
                      <div className="skills-list">
                        {skillGapAnalysis.matchingSkills.map((skill, idx) => (
                          <span key={idx} className="skill-tag matching">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {skillGapAnalysis.missingSkills?.length > 0 && (
                    <div className="skills-section">
                      <h5>📚 Skills to Learn:</h5>
                      <div className="skills-list">
                        {skillGapAnalysis.missingSkills.map((skill, idx) => (
                          <span key={idx} className={`skill-tag missing ${skill.importance.toLowerCase()}`}>
                            {skill.skillName}
                            {skill.importance === 'Critical' && ' ⚡'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="recommendations">
                    <h5>💡 Recommendation:</h5>
                    <p>{skillGapAnalysis.recommendations}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-spinner">Analyzing skills...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;