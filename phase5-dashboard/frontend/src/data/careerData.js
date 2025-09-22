// NSQF Levels and Career Path Mock Data
export const NSQF_LEVELS = {
  1: { level: 1, title: "Basic Work Skills", description: "Helper, assistant roles", education: "Below Secondary" },
  2: { level: 2, title: "Semi-skilled Worker", description: "Operator, trainee roles", education: "Class 5th" },
  3: { level: 3, title: "Skilled Worker", description: "Technician, assistant roles", education: "Class 8th" },
  4: { level: 4, title: "Supervisor/Junior Technical", description: "Junior technical role", education: "Class 10th" },
  5: { level: 5, title: "Diploma/Advanced Technician", description: "Diploma level roles", education: "Class 12th" },
  6: { level: 6, title: "Graduate/Specialized Technical", description: "Bachelor's degree roles", education: "Graduation" },
  7: { level: 7, title: "Postgraduate/Managerial-Specialist", description: "Master's level roles", education: "Post Graduation" },
  8: { level: 8, title: "Research/Senior Management", description: "Research and senior roles", education: "PG + Experience" },
  9: { level: 9, title: "Doctoral-level Expertise", description: "Scientist, expert roles", education: "Doctorate" },
  10: { level: 10, title: "Eminent Expert/Top Leadership", description: "Top leadership roles", education: "Doctorate + Expertise" }
}

export const CAREER_STREAMS = {
  IT: {
    name: "Information Technology",
    icon: "💻",
    levels: {
      1: ["Computer Lab Assistant", "Data Entry Operator"],
      2: ["Junior Computer Operator", "Hardware Trainee"],
      3: ["Computer Technician", "Help Desk Support"],
      4: ["System Administrator", "Network Technician"],
      5: ["Software Developer", "Database Administrator"],
      6: ["Senior Developer", "System Architect"],
      7: ["Tech Lead", "Solution Architect"],
      8: ["Engineering Manager", "Principal Engineer"],
      9: ["Chief Technology Officer", "Research Scientist"],
      10: ["Technology Visionary", "Industry Leader"]
    },
    skills: ["Programming", "Database Management", "System Administration", "Cloud Computing", "Cybersecurity"]
  },
  HEALTHCARE: {
    name: "Healthcare",
    icon: "🏥",
    levels: {
      1: ["Healthcare Assistant", "Medical Receptionist"],
      2: ["Nursing Assistant", "Medical Record Clerk"],
      3: ["Licensed Practical Nurse", "Medical Technician"],
      4: ["Registered Nurse", "Lab Supervisor"],
      5: ["Specialized Nurse", "Medical Imaging Technologist"],
      6: ["Nurse Practitioner", "Medical Officer"],
      7: ["Clinical Specialist", "Department Head"],
      8: ["Medical Director", "Chief Medical Officer"],
      9: ["Medical Research Director", "Healthcare Scientist"],
      10: ["Healthcare Visionary", "Medical Pioneer"]
    },
    skills: ["Patient Care", "Medical Knowledge", "Clinical Skills", "Healthcare Management", "Medical Research"]
  },
  ENGINEERING: {
    name: "Engineering",
    icon: "⚙️",
    levels: {
      1: ["Workshop Helper", "Drawing Assistant"],
      2: ["Junior Technician", "CAD Operator"],
      3: ["Engineering Technician", "Quality Inspector"],
      4: ["Assistant Engineer", "Project Coordinator"],
      5: ["Engineer", "Design Engineer"],
      6: ["Senior Engineer", "Project Manager"],
      7: ["Principal Engineer", "Engineering Manager"],
      8: ["Chief Engineer", "VP Engineering"],
      9: ["Chief Technology Officer", "Research Director"],
      10: ["Engineering Visionary", "Industry Pioneer"]
    },
    skills: ["Technical Design", "Project Management", "Quality Control", "Innovation", "Leadership"]
  },
  FINANCE: {
    name: "Finance & Banking",
    icon: "💰",
    levels: {
      1: ["Bank Clerk", "Cash Handler"],
      2: ["Junior Accountant", "Teller"],
      3: ["Accountant", "Financial Assistant"],
      4: ["Senior Accountant", "Loan Officer"],
      5: ["Financial Analyst", "Branch Manager"],
      6: ["Finance Manager", "Investment Advisor"],
      7: ["Senior Manager", "Portfolio Manager"],
      8: ["VP Finance", "Regional Head"],
      9: ["Chief Financial Officer", "Financial Director"],
      10: ["Finance Industry Leader", "Economic Advisor"]
    },
    skills: ["Financial Analysis", "Accounting", "Risk Management", "Investment Planning", "Banking Operations"]
  },
  AGRICULTURE: {
    name: "Agriculture",
    icon: "🌾",
    levels: {
      1: ["Farm Helper", "Agricultural Laborer"],
      2: ["Equipment Operator", "Crop Assistant"],
      3: ["Agricultural Technician", "Farm Supervisor"],
      4: ["Agricultural Officer", "Extension Worker"],
      5: ["Agricultural Specialist", "Farm Manager"],
      6: ["Agricultural Engineer", "Research Associate"],
      7: ["Senior Specialist", "Agricultural Manager"],
      8: ["Agricultural Director", "Research Head"],
      9: ["Agricultural Scientist", "Policy Researcher"],
      10: ["Agricultural Visionary", "Industry Leader"]
    },
    skills: ["Crop Management", "Agricultural Technology", "Soil Science", "Sustainable Farming", "Agricultural Economics"]
  }
}

export const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Amit Patel",
    currentEducation: "Class 12th Completed",
    currentNSQFLevel: 5,
    targetLevel: 7,
    interests: ["Technology", "Problem Solving"],
    preferredStreams: ["IT"],
    completedSkills: ["Basic Programming", "Computer Fundamentals"],
    location: "Mumbai",
    age: 18
  },
  {
    id: 2,
    name: "Priya Singh",
    currentEducation: "Graduate (B.Sc in Biology)",
    currentNSQFLevel: 6,
    targetLevel: 8,
    interests: ["Healthcare", "Patient Care"],
    preferredStreams: ["HEALTHCARE"],
    completedSkills: ["Medical Knowledge", "Patient Communication"],
    location: "Delhi",
    age: 22
  },
  {
    id: 3,
    name: "Rajesh Kumar",
    currentEducation: "Class 10th Completed",
    currentNSQFLevel: 4,
    targetLevel: 6,
    interests: ["Engineering", "Design"],
    preferredStreams: ["ENGINEERING"],
    completedSkills: ["Technical Drawing", "Basic Mathematics"],
    location: "Bangalore",
    age: 16
  }
]

export const generateCareerRecommendations = (student) => {
  const stream = CAREER_STREAMS[student.preferredStreams[0]]
  if (!stream) return []

  const recommendations = []
  
  // Current level opportunities
  const currentJobs = stream.levels[student.currentNSQFLevel] || []
  
  // Next level opportunities
  const nextLevel = Math.min(student.currentNSQFLevel + 1, 10)
  const nextJobs = stream.levels[nextLevel] || []
  
  // Target level opportunities
  const targetJobs = stream.levels[student.targetLevel] || []

  recommendations.push({
    type: "immediate",
    title: "Ready to Start",
    level: student.currentNSQFLevel,
    jobs: currentJobs,
    description: "Based on your current education, you can start these roles immediately"
  })

  if (nextLevel !== student.currentNSQFLevel) {
    recommendations.push({
      type: "next_step",
      title: "Next Career Step",
      level: nextLevel,
      jobs: nextJobs,
      description: "With additional training or experience, you can move to these roles"
    })
  }

  if (student.targetLevel > nextLevel) {
    recommendations.push({
      type: "target",
      title: "Career Goal",
      level: student.targetLevel,
      jobs: targetJobs,
      description: "Your long-term career aspirations"
    })
  }

  return recommendations
}

export const getRequiredSkillsForLevel = (stream, targetLevel, currentLevel) => {
  const streamData = CAREER_STREAMS[stream]
  if (!streamData) return []

  // Return skills needed to progress from current to target level
  const allSkills = streamData.skills
  const requiredCount = Math.min(targetLevel - currentLevel + 2, allSkills.length)
  
  return allSkills.slice(0, requiredCount)
}

export const getEducationPathway = (currentLevel, targetLevel) => {
  const pathway = []
  
  for (let level = currentLevel; level <= targetLevel; level++) {
    const nsqfLevel = NSQF_LEVELS[level]
    if (nsqfLevel) {
      pathway.push({
        level,
        title: nsqfLevel.title,
        education: nsqfLevel.education,
        description: nsqfLevel.description,
        status: level === currentLevel ? 'current' : level < currentLevel ? 'completed' : 'upcoming'
      })
    }
  }
  
  return pathway
}