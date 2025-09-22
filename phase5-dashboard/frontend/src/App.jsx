import React, { useState } from 'react'
import LearnerDashboard from './components/LearnerDashboard'
import LabourMarketIntegration  from './components/JobRecommendations'
import CareerRecommendationSystem from './components/CareerRecommendationSystem'

export default function App(){
  const [role, setRole] = useState('learner')
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">🎯 Career Navigator Dashboard</h1>
        <div className="flex space-x-2">
          <button className={`px-4 py-2 rounded-lg transition-colors ${role==='learner' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={()=>setRole('learner')}>👨‍🎓 Learner</button>
          <button className={`px-4 py-2 rounded-lg transition-colors ${role==='LabourMarketIntegration' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={()=>setRole('LabourMarketIntegration')}>👨‍🏫 jobs</button>
          <button className={`px-4 py-2 rounded-lg transition-colors ${role==='career' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} onClick={()=>setRole('career')}>🚀 Career Path</button>
        </div>
      </header>

      <main>
        {role==='learner' && <LearnerDashboard learnerId={'learner_001'} />}
        {role==='LabourMarketIntegration' && <LabourMarketIntegration />}
        {role==='career' && <CareerRecommendationSystem />}
      </main>
    </div>
  )
}