import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { apiEndpoints } from '../api'
import { NSQF_LEVELS, CAREER_STREAMS, generateCareerRecommendations, getEducationPathway } from '../data/careerData'
import InteractiveCareerFlowchart from './InteractiveCareerFlowchart'

const LearnerDashboard = ({ learnerId }) => {
  const [learnerData, setLearnerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock student data with NSQF integration
  const mockLearnerData = {
    id: learnerId,
    name: "Amit Patel", 
    currentEducation: "Class 12th Completed",
    currentNSQFLevel: 5,
    targetLevel: 7,
    interests: ["Technology", "Problem Solving"],
    preferredStreams: ["IT"],
    completedSkills: ["Basic Programming", "Computer Fundamentals"],
    location: "Mumbai",
    age: 18,
    email: "amit.patel@example.com",
    currentSkills: [
      { skill: "Programming", current: 65, required: 85 },
      { skill: "Problem Solving", current: 70, required: 80 },
      { skill: "Communication", current: 60, required: 75 },
      { skill: "Technical Skills", current: 55, required: 90 }
    ],
    nextSteps: [
      {
        title: "Complete JavaScript Advanced Course",
        description: "Master advanced JavaScript concepts",
        duration: "4 weeks",
        difficulty: "Intermediate"
      },
      {
        title: "Build Portfolio Project",
        description: "Create a full-stack web application",
        duration: "6 weeks",
        difficulty: "Advanced"
      }
    ],
    learningHours: { thisWeek: 12, thisMonth: 45, total: 156 },
    enrolledCourses: ["Web Development Fundamentals", "JavaScript Basics"],
    completedCourses: ["Computer Fundamentals", "Basic Programming"],
    achievements: [
      { title: "First Project Completed", date: "2024-01-10", type: "milestone" },
      { title: "JavaScript Basics Certified", date: "2024-01-05", type: "certification" }
    ]
  }

  useEffect(() => {
    fetchLearnerData()
  }, [learnerId])

  const fetchLearnerData = async () => {
    try {
      setLoading(true)
      setTimeout(() => {
        setLearnerData(mockLearnerData)
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  // Generate career recommendations
  const recommendations = generateCareerRecommendations(learnerData)
  
  // Create comprehensive pathway with career options for D3.js flowchart
  const pathway = {
    title: "Web Development Career Options",
    description: "Career paths based on your current skills and experience level",
    progress: 65,
    modules: [
      // Entry Level Jobs (Foundation Skills Required)
      {
        module_id: "junior_frontend",
        title: "Junior Frontend Developer",
        description: "HTML, CSS, JavaScript basics",
        status: "available",
        score: 0,
        salary: "₹3-5 LPA",
        skillGroup: "entry"
      },
      {
        module_id: "ui_intern",
        title: "UI/UX Intern", 
        description: "Design tools and basic web knowledge",
        status: "available",
        score: 0,
        salary: "₹2-3 LPA",
        skillGroup: "entry"
      },
      {
        module_id: "web_intern",
        title: "Web Development Intern",
        description: "Basic programming and web fundamentals",
        status: "available",
        score: 0,
        salary: "₹1.5-2.5 LPA",
        skillGroup: "entry"
      },

      // Mid-Level Jobs (Core Skills Required)
      {
        module_id: "frontend_dev",
        title: "Frontend Developer",
        description: "React, APIs, responsive design",
        status: "target",
        score: 70,
        salary: "₹5-8 LPA",
        skillGroup: "mid"
      },
      {
        module_id: "fullstack_junior",
        title: "Junior Full Stack Developer",
        description: "Frontend + Backend basics",
        status: "future",
        score: 0,
        salary: "₹6-10 LPA",
        skillGroup: "mid"
      },
      {
        module_id: "ui_developer",
        title: "UI Developer",
        description: "Advanced CSS, design systems",
        status: "future",
        score: 0,
        salary: "₹4-7 LPA",
        skillGroup: "mid"
      },
      {
        module_id: "backend_dev",
        title: "Backend Developer",
        description: "Databases, APIs, server management",
        status: "future",
        score: 0,
        salary: "₹6-9 LPA",
        skillGroup: "mid"
      },

      // Senior Level Jobs (Advanced Skills Required)
      {
        module_id: "senior_frontend",
        title: "Senior Frontend Developer", 
        description: "Architecture, performance, mentoring",
        status: "future",
        score: 0,
        salary: "₹10-15 LPA",
        skillGroup: "senior"
      },
      {
        module_id: "fullstack_dev",
        title: "Full Stack Developer",
        description: "End-to-end development expertise",
        status: "future",
        score: 0,
        salary: "₹12-18 LPA",
        skillGroup: "senior"
      },
      {
        module_id: "devops_engineer",
        title: "DevOps Engineer",
        description: "Cloud, deployment, automation",
        status: "future",
        score: 0,
        salary: "₹10-16 LPA",
        skillGroup: "senior"
      },

      // Leadership Level Jobs (Specialist Skills Required)
      {
        module_id: "tech_lead",
        title: "Technical Lead",
        description: "Team leadership, architecture decisions",
        status: "future",
        score: 0,
        salary: "₹18-25 LPA",
        skillGroup: "leadership"
      },
      {
        module_id: "solution_architect",
        title: "Solution Architect",
        description: "System design, technical strategy",
        status: "future",
        score: 0,
        salary: "₹20-30 LPA", 
        skillGroup: "leadership"
      }
    ]
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{learnerData.name}</h2>
            <p className="text-blue-100">{learnerData.currentEducation} • {learnerData.location}</p>
            <p className="text-sm text-blue-200">👨‍🎓 Age: {learnerData.age} • 📧 {learnerData.email}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{learnerData.learningHours.thisWeek}h</div>
              <div className="text-sm text-blue-200">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{learnerData.completedCourses.length}</div>
              <div className="text-sm text-blue-200">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{learnerData.enrolledCourses.length}</div>
              <div className="text-sm text-blue-200">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* NSQF Progress */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 NSQF Level Progression</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Level {learnerData.currentNSQFLevel}</div>
            <div className="text-sm text-blue-800">Current Level</div>
            <div className="text-xs text-gray-500">{NSQF_LEVELS[learnerData.currentNSQFLevel]?.title}</div>
          </div>
          <div className="flex-1 mx-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${((learnerData.currentNSQFLevel - 1) / (learnerData.targetLevel - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              Progress to Level {learnerData.targetLevel}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">Level {learnerData.targetLevel}</div>
            <div className="text-sm text-green-800">Target Level</div>
            <div className="text-xs text-gray-500">{NSQF_LEVELS[learnerData.targetLevel]?.title}</div>
          </div>
        </div>

        {/* Pathway Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {pathway.modules.slice(0, 4).map((module, index) => (
            <div key={index} className={`p-2 rounded text-center text-sm ${
              module.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              module.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">{module.status === 'completed' ? '✓' : module.status === 'in_progress' ? '▶' : '○'}</div>
              <div className="text-xs">{module.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">💼 Career Recommendations</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
            View All Recommendations
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                  Level {rec.level}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
              <div className="flex flex-wrap gap-2">
                {rec.jobs.slice(0, 3).map((job, jobIndex) => (
                  <span key={jobIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {job}
                  </span>
                ))}
                {rec.jobs.length > 3 && (
                  <span className="px-2 py-1 text-gray-500 text-sm">
                    +{rec.jobs.length - 3} more
                  </span>
                )}
              </div>
              <button className="mt-3 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                Explore Path
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Career Path Flowchart */}
      <InteractiveCareerFlowchart 
        pathway={pathway} 
        onModuleClick={(module) => {
          console.log('Module clicked:', module)
          // Add any additional click handling here
        }}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Assessment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Skills Assessment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={learnerData.currentSkills}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="current" fill="#3B82F6" name="Current Level" />
              <Bar dataKey="required" fill="#10B981" name="Required Level" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {learnerData.currentSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-800">{skill.skill}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Gap: {skill.required - skill.current}%</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    skill.current >= skill.required ? 'bg-green-100 text-green-800' :
                    skill.current >= skill.required * 0.8 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {skill.current >= skill.required ? 'Proficient' :
                     skill.current >= skill.required * 0.8 ? 'Nearly There' : 'Needs Work'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🚀 Next Steps</h3>
          <div className="space-y-4">
            {learnerData.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-indigo-900">{step.title}</h4>
                  <p className="text-sm text-indigo-700 mt-1">{step.description}</p>
                  <div className="flex items-center mt-2 space-x-3">
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                      ⏱️ {step.duration}
                    </span>
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                      📊 {step.difficulty}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learnerData.achievements.map((achievement, index) => (
            <div key={index} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-600">
                  {achievement.type === 'milestone' && '🎯'}
                  {achievement.type === 'certification' && '📜'}
                  {achievement.type === 'streak' && '🔥'}
                </span>
                <h4 className="font-semibold text-yellow-900">{achievement.title}</h4>
              </div>
              <p className="text-sm text-yellow-700">{achievement.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Courses */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Current Courses</h3>
        <div className="space-y-4">
          {learnerData.enrolledCourses.map((course, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-800">{course}</h4>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${65 + index * 10}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{65 + index * 10}%</span>
                <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboard