import { useState, useEffect } from 'react'
import { 
  NSQF_LEVELS, 
  CAREER_STREAMS, 
  MOCK_STUDENTS, 
  generateCareerRecommendations, 
  getRequiredSkillsForLevel,
  getEducationPathway 
} from '../data/careerData'

const CareerRecommendationSystem = () => {
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0])
  const [selectedStream, setSelectedStream] = useState('IT')
  const [recommendations, setRecommendations] = useState([])
  const [showPathway, setShowPathway] = useState(false)
  const [activeTab, setActiveTab] = useState('recommendations')

  useEffect(() => {
    if (selectedStudent) {
      const recs = generateCareerRecommendations(selectedStudent)
      setRecommendations(recs)
    }
  }, [selectedStudent, selectedStream])

  const handleStreamChange = (streamKey) => {
    setSelectedStream(streamKey)
    const updatedStudent = {
      ...selectedStudent,
      preferredStreams: [streamKey]
    }
    setSelectedStudent(updatedStudent)
  }

  const handleEducationLevelChange = (newLevel) => {
    const updatedStudent = {
      ...selectedStudent,
      currentNSQFLevel: parseInt(newLevel)
    }
    setSelectedStudent(updatedStudent)
  }

  const handleTargetLevelChange = (newTarget) => {
    const updatedStudent = {
      ...selectedStudent,
      targetLevel: parseInt(newTarget)
    }
    setSelectedStudent(updatedStudent)
  }

  const StudentProfileCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">
            {selectedStudent.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
          <p className="text-gray-600">{selectedStudent.currentEducation}</p>
          <p className="text-sm text-gray-500">📍 {selectedStudent.location} • Age: {selectedStudent.age}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">Level {selectedStudent.currentNSQFLevel}</div>
          <div className="text-sm text-blue-800">Current NSQF Level</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">Level {selectedStudent.targetLevel}</div>
          <div className="text-sm text-green-800">Target Level</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">💼 Interests</h4>
        <div className="flex flex-wrap gap-2">
          {selectedStudent.interests.map((interest, index) => (
            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">✅ Completed Skills</h4>
        <div className="flex flex-wrap gap-2">
          {selectedStudent.completedSkills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const StreamSelector = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Choose Your Career Stream</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(CAREER_STREAMS).map(([key, stream]) => (
          <button
            key={key}
            onClick={() => handleStreamChange(key)}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              selectedStream === key
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">{stream.icon}</div>
            <div className="text-sm font-medium">{stream.name}</div>
          </button>
        ))}
      </div>
    </div>
  )

  const ControlPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Adjust Profile</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student
          </label>
          <select
            value={selectedStudent.id}
            onChange={(e) => {
              const student = MOCK_STUDENTS.find(s => s.id === parseInt(e.target.value))
              setSelectedStudent(student)
              setSelectedStream(student.preferredStreams[0])
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {MOCK_STUDENTS.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current NSQF Level
          </label>
          <select
            value={selectedStudent.currentNSQFLevel}
            onChange={(e) => handleEducationLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {Object.entries(NSQF_LEVELS).map(([level, data]) => (
              <option key={level} value={level}>Level {level} - {data.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target NSQF Level
          </label>
          <select
            value={selectedStudent.targetLevel}
            onChange={(e) => handleTargetLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {Object.entries(NSQF_LEVELS).map(([level, data]) => (
              <option key={level} value={level}>Level {level} - {data.title}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const RecommendationCards = () => (
    <div className="space-y-6">
      {recommendations.map((rec, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{rec.title}</h3>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </div>
            <div className="text-center">
              <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                NSQF Level {rec.level}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {NSQF_LEVELS[rec.level]?.title}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rec.jobs.map((job, jobIndex) => (
              <div key={jobIndex} className={`p-3 rounded-lg border ${
                rec.type === 'immediate' ? 'border-green-200 bg-green-50' :
                rec.type === 'next_step' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="font-medium text-gray-800">{job}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {rec.type === 'immediate' && '✅ Ready to apply'}
                  {rec.type === 'next_step' && '⏳ With training'}
                  {rec.type === 'target' && '🎯 Career goal'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex space-x-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              View Details
            </button>
            <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
              Find Courses
            </button>
            {rec.type === 'target' && (
              <button 
                onClick={() => setShowPathway(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Show Learning Path
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const EducationPathway = () => {
    const pathway = getEducationPathway(selectedStudent.currentNSQFLevel, selectedStudent.targetLevel)
    const requiredSkills = getRequiredSkillsForLevel(selectedStream, selectedStudent.targetLevel, selectedStudent.currentNSQFLevel)

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎓 Education Pathway</h3>
          <div className="space-y-4">
            {pathway.map((step, index) => (
              <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg ${
                step.status === 'current' ? 'bg-blue-50 border-l-4 border-blue-500' :
                step.status === 'completed' ? 'bg-green-50 border-l-4 border-green-500' :
                'bg-gray-50 border-l-4 border-gray-300'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step.status === 'current' ? 'bg-blue-500 text-white' :
                  step.status === 'completed' ? 'bg-green-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step.level}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.education}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                <div className="text-sm">
                  {step.status === 'current' && <span className="text-blue-600 font-medium">Current Level</span>}
                  {step.status === 'completed' && <span className="text-green-600">✓ Completed</span>}
                  {step.status === 'upcoming' && <span className="text-gray-500">Upcoming</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Skills to Develop</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {requiredSkills.map((skill, index) => (
              <div key={index} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">{skill}</div>
                <div className="text-sm text-orange-600 mt-1">Required for advancement</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🚀 Career Path Recommendation System</h1>
        <p className="text-purple-100">Discover your personalized career journey based on NSQF framework</p>
      </div>

      {/* Control Panel */}
      <ControlPanel />

      {/* Student Profile and Stream Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentProfileCard />
        <StreamSelector />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'recommendations'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎯 Career Recommendations
          </button>
          <button
            onClick={() => setActiveTab('pathway')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'pathway'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎓 Learning Pathway
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'recommendations' && <RecommendationCards />}
          {activeTab === 'pathway' && <EducationPathway />}
        </div>
      </div>
    </div>
  )
}

export default CareerRecommendationSystem