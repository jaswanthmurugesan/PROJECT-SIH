import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LearnerProfileForm.css';
import { learnerAPI } from '../services/api';

const LearnerProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    userId: user?._id || '',
    personalInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      gender: ''
    },
    academicBackground: {
      highestEducation: '',
      fieldOfStudy: '',
      instituteName: '',
      graduationYear: '',
      marks: '',
      certifications: []
    },
    skills: {
      technicalSkills: [],
      softSkills: [],
      languages: []
    },
    socioEconomicContext: {
      location: {
        state: '',
        district: '',
        city: '',
        pincode: '',
        isUrban: false
      },
      familyIncome: '',
      employmentStatus: '',
      workExperience: [],
      financialConstraints: {
        canAffordPaidCourses: false,
        preferredBudget: '',
        needsFinancialAssistance: false
      },
      accessToTechnology: {
        hasSmartphone: false,
        hasComputer: false,
        hasReliableInternet: false,
        preferredDeviceForLearning: 'Any'
      }
    },
    learningPace: {
      availableHoursPerWeek: '',
      preferredLearningTime: '',
      learningStyle: '',
      pacePreference: '',
      attentionSpan: '',
      previousLearningExperience: {
        hasOnlineLearningExperience: false,
        completedCourses: '',
        dropoutRate: '',
        preferredContentFormat: 'Mixed'
      }
    },
    aspirations: {
      careerGoals: {
        shortTerm: [],
        longTerm: [],
        dreamJob: ''
      },
      industries: [],
      rolePreferences: [],
      salaryExpectations: {
        currentSalary: '',
        expectedSalary: '',
        timeframeToAchieve: ''
      },
      workEnvironmentPreferences: {
        preferredWorkMode: 'Flexible',
        companySize: 'Any',
        willingToRelocate: false
      },
      entrepreneurialInterest: {
        interestedInStartup: false,
        businessIdeas: [],
        riskTolerance: 'Medium'
      }
    }
  });

  const totalSteps = 6;

  // Update form data when user info is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userId: user._id,
        personalInfo: {
          ...prev.personalInfo,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || ''
        }
      }));
    }
  }, [user]);

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (subField) {
        newData[section] = {
          ...newData[section],
          [field]: {
            ...newData[section][field],
            [subField]: value
          }
        };
      } else {
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }
      return newData;
    });
  };

  const addSkill = (skillType, skill) => {
    if (skill.skillName.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillType]: [...prev.skills[skillType], skill]
        }
      }));
    }
  };

  const removeSkill = (skillType, index) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillType]: prev.skills[skillType].filter((_, i) => i !== index)
      }
    }));
  };

  const addListItem = (section, field, item) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], item]
        }
      }));
    }
  };

  const removeListItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting profile data:', formData);
      const response = await learnerAPI.createProfile(formData);
      console.log('Profile created successfully:', response.data);
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Wait a moment then navigate
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error creating profile:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error creating profile. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="user-info-banner">
              <p>Welcome, {user?.firstName}! Complete your profile to get personalized learning paths.</p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  required
                  placeholder="Enter your first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                required
                placeholder="Enter your email address"
                disabled={!!user?.email}
                style={{ 
                  backgroundColor: user?.email ? '#f8f9fa' : 'white',
                  cursor: user?.email ? 'not-allowed' : 'text'
                }}
              />
              {user?.email && (
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  Email is pre-filled from your account and cannot be changed here.
                </small>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Gender:</label>
              <select
                value={formData.personalInfo.gender}
                onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <h3>Academic Background</h3>
            <div className="form-group">
              <label>Highest Education:</label>
              <select
                value={formData.academicBackground.highestEducation}
                onChange={(e) => handleInputChange('academicBackground', 'highestEducation', e.target.value)}
                required
              >
                <option value="">Select Education Level</option>
                <option value="Below 10th">Below 10th</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Field of Study:</label>
              <input
                type="text"
                value={formData.academicBackground.fieldOfStudy}
                onChange={(e) => handleInputChange('academicBackground', 'fieldOfStudy', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Institute Name:</label>
                <input
                  type="text"
                  value={formData.academicBackground.instituteName}
                  onChange={(e) => handleInputChange('academicBackground', 'instituteName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Graduation Year:</label>
                <input
                  type="number"
                  value={formData.academicBackground.graduationYear}
                  onChange={(e) => handleInputChange('academicBackground', 'graduationYear', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Marks/Percentage:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.academicBackground.marks}
                onChange={(e) => handleInputChange('academicBackground', 'marks', e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h3>Skills & Languages</h3>
            <div className="skills-section">
              <h4>Technical Skills</h4>
              <SkillInput
                skills={formData.skills.technicalSkills}
                onAdd={(skill) => addSkill('technicalSkills', skill)}
                onRemove={(index) => removeSkill('technicalSkills', index)}
                hasExperience={true}
              />
            </div>
            <div className="skills-section">
              <h4>Soft Skills</h4>
              <SkillInput
                skills={formData.skills.softSkills}
                onAdd={(skill) => addSkill('softSkills', skill)}
                onRemove={(index) => removeSkill('softSkills', index)}
                hasExperience={false}
              />
            </div>
            <div className="skills-section">
              <h4>Languages</h4>
              <LanguageInput
                languages={formData.skills.languages}
                onAdd={(language) => addSkill('languages', language)}
                onRemove={(index) => removeSkill('languages', index)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-section">
            <h3>Socio-Economic Context</h3>
            <div className="subsection">
              <h4>Location</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>State:</label>
                  <input
                    type="text"
                    value={formData.socioEconomicContext.location.state}
                    onChange={(e) => handleInputChange('socioEconomicContext', 'location', e.target.value, 'state')}
                  />
                </div>
                <div className="form-group">
                  <label>City:</label>
                  <input
                    type="text"
                    value={formData.socioEconomicContext.location.city}
                    onChange={(e) => handleInputChange('socioEconomicContext', 'location', e.target.value, 'city')}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.socioEconomicContext.location.isUrban}
                    onChange={(e) => handleInputChange('socioEconomicContext', 'location', e.target.checked, 'isUrban')}
                  />
                  Urban Area
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Family Income:</label>
              <select
                value={formData.socioEconomicContext.familyIncome}
                onChange={(e) => handleInputChange('socioEconomicContext', 'familyIncome', e.target.value)}
              >
                <option value="">Select Income Range</option>
                <option value="Below 1 Lakh">Below 1 Lakh</option>
                <option value="1-3 Lakhs">1-3 Lakhs</option>
                <option value="3-5 Lakhs">3-5 Lakhs</option>
                <option value="5-10 Lakhs">5-10 Lakhs</option>
                <option value="10-20 Lakhs">10-20 Lakhs</option>
                <option value="Above 20 Lakhs">Above 20 Lakhs</option>
              </select>
            </div>

            <div className="form-group">
              <label>Employment Status:</label>
              <select
                value={formData.socioEconomicContext.employmentStatus}
                onChange={(e) => handleInputChange('socioEconomicContext', 'employmentStatus', e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Student">Student</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="subsection">
              <h4>Access to Technology</h4>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.socioEconomicContext.accessToTechnology.hasSmartphone}
                    onChange={(e) => handleInputChange('socioEconomicContext', 'accessToTechnology', e.target.checked, 'hasSmartphone')}
                  />
                  Has Smartphone
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.socioEconomicContext.accessToTechnology.hasComputer}
                    onChange={(e) => handleInputChange('socioEconomicContext', 'accessToTechnology', e.target.checked, 'hasComputer')}
                  />
                  Has Computer
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.socioEconomicContext.accessToTechnology.hasReliableInternet}
                    onChange={(e) => handleInputChange('socioEconomicContext', 'accessToTechnology', e.target.checked, 'hasReliableInternet')}
                  />
                  Has Reliable Internet
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-section">
            <h3>Learning Pace & Preferences</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Available Hours Per Week:</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formData.learningPace.availableHoursPerWeek}
                  onChange={(e) => handleInputChange('learningPace', 'availableHoursPerWeek', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Preferred Learning Time:</label>
                <select
                  value={formData.learningPace.preferredLearningTime}
                  onChange={(e) => handleInputChange('learningPace', 'preferredLearningTime', e.target.value)}
                >
                  <option value="">Select Time</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Learning Style:</label>
                <select
                  value={formData.learningPace.learningStyle}
                  onChange={(e) => handleInputChange('learningPace', 'learningStyle', e.target.value)}
                >
                  <option value="">Select Style</option>
                  <option value="Visual">Visual</option>
                  <option value="Auditory">Auditory</option>
                  <option value="Kinesthetic">Kinesthetic</option>
                  <option value="Reading/Writing">Reading/Writing</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pace Preference:</label>
                <select
                  value={formData.learningPace.pacePreference}
                  onChange={(e) => handleInputChange('learningPace', 'pacePreference', e.target.value)}
                >
                  <option value="">Select Pace</option>
                  <option value="Self-Paced">Self-Paced</option>
                  <option value="Structured">Structured</option>
                  <option value="Intensive">Intensive</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Attention Span:</label>
              <select
                value={formData.learningPace.attentionSpan}
                onChange={(e) => handleInputChange('learningPace', 'attentionSpan', e.target.value)}
              >
                <option value="">Select Attention Span</option>
                <option value="Short (15-30 min)">Short (15-30 min)</option>
                <option value="Medium (30-60 min)">Medium (30-60 min)</option>
                <option value="Long (1-2 hours)">Long (1-2 hours)</option>
                <option value="Extended (2+ hours)">Extended (2+ hours)</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.learningPace.previousLearningExperience.hasOnlineLearningExperience}
                  onChange={(e) => handleInputChange('learningPace', 'previousLearningExperience', e.target.checked, 'hasOnlineLearningExperience')}
                />
                Has Online Learning Experience
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="form-section">
            <h3>Career Aspirations</h3>
            <div className="form-group">
              <label>Dream Job:</label>
              <input
                type="text"
                value={formData.aspirations.careerGoals.dreamJob}
                onChange={(e) => handleInputChange('aspirations', 'careerGoals', e.target.value, 'dreamJob')}
              />
            </div>

            <div className="subsection">
              <h4>Short-term Goals (1-2 years)</h4>
              <ListInput
                items={formData.aspirations.careerGoals.shortTerm}
                onAdd={(item) => addListItem('aspirations', 'careerGoals', { ...formData.aspirations.careerGoals, shortTerm: [...formData.aspirations.careerGoals.shortTerm, item] })}
                onRemove={(index) => removeListItem('aspirations', 'careerGoals', index)}
                placeholder="Add short-term goal"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expected Salary:</label>
                <input
                  type="number"
                  value={formData.aspirations.salaryExpectations.expectedSalary}
                  onChange={(e) => handleInputChange('aspirations', 'salaryExpectations', e.target.value, 'expectedSalary')}
                />
              </div>
              <div className="form-group">
                <label>Preferred Work Mode:</label>
                <select
                  value={formData.aspirations.workEnvironmentPreferences.preferredWorkMode}
                  onChange={(e) => handleInputChange('aspirations', 'workEnvironmentPreferences', e.target.value, 'preferredWorkMode')}
                >
                  <option value="">Select Work Mode</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aspirations.workEnvironmentPreferences.willingToRelocate}
                  onChange={(e) => handleInputChange('aspirations', 'workEnvironmentPreferences', e.target.checked, 'willingToRelocate')}
                />
                Willing to Relocate
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aspirations.entrepreneurialInterest.interestedInStartup}
                  onChange={(e) => handleInputChange('aspirations', 'entrepreneurialInterest', e.target.checked, 'interestedInStartup')}
                />
                Interested in Entrepreneurship/Startup
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="learner-profile-form">
      {showSuccessMessage ? (
        <div className="success-container">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Profile Created Successfully!</h2>
            <p>Your personalized learning journey is about to begin. Redirecting to your dashboard...</p>
            <div className="spinner" style={{ margin: '20px auto' }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="form-header">
            <h2>Complete Your Learner Profile</h2>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <p>Step {currentStep} of {totalSteps}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="form-navigation">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary" disabled={isSubmitting}>
                  ← Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="btn-primary" disabled={isSubmitting}>
                  Next →
                </button>
              ) : (
                <button type="submit" className="btn-success" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Profile ✨
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
};

// Helper Components
const SkillInput = ({ skills, onAdd, onRemove, hasExperience }) => {
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    proficiencyLevel: 'Beginner',
    yearsOfExperience: 0
  });

  const handleAdd = () => {
    if (newSkill.skillName.trim()) {
      onAdd(newSkill);
      setNewSkill({
        skillName: '',
        proficiencyLevel: 'Beginner',
        yearsOfExperience: 0
      });
    }
  };

  return (
    <div className="skill-input">
      <div className="add-skill">
        <input
          type="text"
          placeholder="Skill name"
          value={newSkill.skillName}
          onChange={(e) => setNewSkill({...newSkill, skillName: e.target.value})}
        />
        <select
          value={newSkill.proficiencyLevel}
          onChange={(e) => setNewSkill({...newSkill, proficiencyLevel: e.target.value})}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        {hasExperience && (
          <input
            type="number"
            placeholder="Years"
            min="0"
            value={newSkill.yearsOfExperience}
            onChange={(e) => setNewSkill({...newSkill, yearsOfExperience: e.target.value})}
          />
        )}
        <button type="button" onClick={handleAdd} className="btn-add">Add</button>
      </div>
      <div className="skills-list">
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <span>{skill.skillName} - {skill.proficiencyLevel}</span>
            {hasExperience && <span>({skill.yearsOfExperience} years)</span>}
            <button type="button" onClick={() => onRemove(index)} className="btn-remove">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const LanguageInput = ({ languages, onAdd, onRemove }) => {
  const [newLanguage, setNewLanguage] = useState({
    language: '',
    proficiency: 'Basic'
  });

  const handleAdd = () => {
    if (newLanguage.language.trim()) {
      onAdd(newLanguage);
      setNewLanguage({ language: '', proficiency: 'Basic' });
    }
  };

  return (
    <div className="language-input">
      <div className="add-language">
        <input
          type="text"
          placeholder="Language"
          value={newLanguage.language}
          onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
        />
        <select
          value={newLanguage.proficiency}
          onChange={(e) => setNewLanguage({...newLanguage, proficiency: e.target.value})}
        >
          <option value="Basic">Basic</option>
          <option value="Conversational">Conversational</option>
          <option value="Fluent">Fluent</option>
          <option value="Native">Native</option>
        </select>
        <button type="button" onClick={handleAdd} className="btn-add">Add</button>
      </div>
      <div className="languages-list">
        {languages.map((lang, index) => (
          <div key={index} className="language-item">
            <span>{lang.language} - {lang.proficiency}</span>
            <button type="button" onClick={() => onRemove(index)} className="btn-remove">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ListInput = ({ items, onAdd, onRemove, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem);
      setNewItem('');
    }
  };

  return (
    <div className="list-input">
      <div className="add-item">
        <input
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button type="button" onClick={handleAdd} className="btn-add">Add</button>
      </div>
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="list-item">
            <span>{item}</span>
            <button type="button" onClick={() => onRemove(index)} className="btn-remove">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnerProfileForm;