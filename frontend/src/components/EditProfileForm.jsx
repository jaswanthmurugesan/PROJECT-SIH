import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LearnerProfileForm.css';
import './EditProfile.css';
import { learnerAPI } from '../services/api';

const EditProfileForm = ({ currentProfile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    userId: user?._id || '',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
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

  // Load current profile data into form
  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Updating profile data:', formData);
      const response = await learnerAPI.updateProfile(currentProfile._id, formData);
      console.log('Profile updated successfully:', response.data);
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Wait a moment then navigate back to dashboard
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error updating profile. Please try again.';
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
    } else {
      // Submit the form when on the last step
      document.getElementById('profile-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="profile-form-container">
        <div className="learner-profile-form">
          <div className="success-message">
            <div className="success-icon">🎉</div>
            <h2>Profile Updated Successfully!</h2>
            <p>Your profile has been updated. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  required
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
                disabled={!!user?.email}
                style={{ 
                  backgroundColor: user?.email ? '#f8f9fa' : 'white',
                  cursor: user?.email ? 'not-allowed' : 'text'
                }}
              />
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
                  value={formData.personalInfo.dateOfBirth?.split('T')[0] || ''}
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
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h3>Skills</h3>
            <p>Update your technical and soft skills to get better recommendations.</p>
            <div className="skills-summary">
              <div className="skills-count">
                <span>Technical: {formData.skills.technicalSkills.length}</span>
                <span>Soft Skills: {formData.skills.softSkills.length}</span>
                <span>Languages: {formData.skills.languages.length}</span>
              </div>
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
                    onChange={(e) => handleNestedInputChange('socioEconomicContext', 'location', 'state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>City:</label>
                  <input
                    type="text"
                    value={formData.socioEconomicContext.location.city}
                    onChange={(e) => handleNestedInputChange('socioEconomicContext', 'location', 'city', e.target.value)}
                  />
                </div>
              </div>
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
          </div>
        );

      case 5:
        return (
          <div className="form-section">
            <h3>Learning Pace & Preferences</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Available Hours per Week:</label>
                <input
                  type="number"
                  value={formData.learningPace.availableHoursPerWeek}
                  onChange={(e) => handleInputChange('learningPace', 'availableHoursPerWeek', e.target.value)}
                  min="1"
                  max="168"
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
                onChange={(e) => handleNestedInputChange('aspirations', 'careerGoals', 'dreamJob', e.target.value)}
                placeholder="What's your dream job?"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expected Salary:</label>
                <input
                  type="number"
                  value={formData.aspirations.salaryExpectations.expectedSalary}
                  onChange={(e) => handleNestedInputChange('aspirations', 'salaryExpectations', 'expectedSalary', e.target.value)}
                  placeholder="Annual salary expectation"
                />
              </div>
              <div className="form-group">
                <label>Preferred Work Mode:</label>
                <select
                  value={formData.aspirations.workEnvironmentPreferences.preferredWorkMode}
                  onChange={(e) => handleNestedInputChange('aspirations', 'workEnvironmentPreferences', 'preferredWorkMode', e.target.value)}
                >
                  <option value="">Select Mode</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Step {currentStep} - Implementation needed</div>;
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="learner-profile-form">
        <div className="edit-form-header">
          <h1>Edit Your Profile</h1>
          <p>Update your information to get better recommendations</p>
          <div className="progress-indicator">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">Step {currentStep} of {totalSteps}</span>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleSubmit}>
          {renderStep()}
          
          <div className="edit-form-navigation">
            <button 
              type="button" 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className="btn-secondary"
            >
              ← Previous
            </button>
            
            <div className="btn-group">
              <button 
                type="button" 
                onClick={() => navigate('/profile')}
                className="btn-tertiary"
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                onClick={nextStep}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Updating...' : 
                 currentStep === totalSteps ? 'Update Profile' : 'Next →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;