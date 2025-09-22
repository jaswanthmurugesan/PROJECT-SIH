import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, DollarSign, Filter, MapPin, Clock, Star, ChevronDown, Search, Zap, ArrowRight } from 'lucide-react';

const LabourMarketIntegration = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [salaryRange, setSalaryRange] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for job market trends
  const trendData = [
    { month: 'Jan', evTech: 55, aiml: 32, renewable: 78, healthcare: 88, fintech: 85 },
    { month: 'Feb', evTech: 62, aiml: 35, renewable: 82, healthcare: 90, fintech: 87 },
    { month: 'Mar', evTech: 72, aiml: 98, renewable: 85, healthcare: 92, fintech: 89 },
    { month: 'Apr', evTech: 76, aiml: 92, renewable: 78, healthcare: 75, fintech: 71 },
    { month: 'May', evTech: 100, aiml: 105, renewable: 92, healthcare: 98, fintech: 94 },
    { month: 'Jun', evTech: 105, aiml: 118, renewable: 110, healthcare: 100, fintech: 97 }
  ];  

  // Skills gap analysis data
  const skillsGapData = [
    { skill: 'AI/ML Engineering', demand: 95, supply: 85, gap: 50 },
    { skill: 'EV Technology', demand: 18, supply: 25, gap: 53 },
    { skill: 'Renewable Energy', demand: 82, supply: 42, gap: 40 },
    { skill: 'Cybersecurity', demand: 60, supply: 55, gap: 35 },
    { skill: 'Cloud Computing', demand: 85, supply: 58, gap: 27 },
    { skill: 'Data Science', demand: 47, supply: 12, gap: 25 }
  ];

  // Industry distribution
  const industryData = [
    { name: 'Technology', value: 65, color: '#8b5cf6' },
    { name: 'Healthcare', value: 25, color: '#06b6d4' },
    { name: 'Finance', value: 20, color: '#10b981' },
    { name: 'Manufacturing', value: 12, color: '#f59e0b' },
    { name: 'Others', value: 8, color: '#ef4444' }
  ];

  // Job listings data - matching the design from image
  const allJobs = [
    {
      id: 1,
      title: 'Python Backend Developer',
      skills: ['UI Design', 'React', 'Figma', 'CSS'],
      keySkills: ['Python', 'Flask', 'SQL', 'API Development'],
      salaryRange: '$115,000 - $140,000',
      description: 'Develop robust backend systems with Python, Flask and SQLAlchemy.',
      match: 70,
      industry: 'technology'
    },
    {
      id: 2,
      title: 'Machine Learning Engineer',
      skills: ['UI Design', 'React', 'Figma', 'CSS'],
      keySkills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
      salaryRange: '$130,000 - $160,000',
      description: 'Build and deploy machine learning models for real-world applications.',
      match: 44,
      industry: 'technology'
    },
    {
      id: 3,
      title: 'Senior EV Powertrain Engineer',
      skills: ['Mechanical Design', 'CAD', 'MATLAB', 'Electronics'],
      keySkills: ['Battery Management', 'Motor Control', 'Power Electronics', 'MATLAB/Simulink'],
      salaryRange: '$120,000 - $180,000',
      description: 'Lead the development of next-generation electric vehicle powertrain systems.',
      match: 82,
      industry: 'automotive'
    },
    {
      id: 4,
      title: 'Renewable Energy Systems Designer',
      skills: ['Solar Design', 'AutoCAD', 'Project Management', 'Engineering'],
      keySkills: ['Solar Design', 'AutoCAD', 'PVsyst', 'Electrical Engineering'],
      salaryRange: '$90,000 - $130,000',
      description: 'Design and optimize solar energy systems for residential and commercial applications.',
      match: 65,
      industry: 'renewable'
    },
    {
      id: 5,
      title: 'Senior Data Scientist',
      skills: ['Python', 'Statistics', 'Machine Learning', 'Analytics'],
      keySkills: ['Python', 'R', 'SQL', 'Statistics', 'A/B Testing'],
      salaryRange: '$140,000 - $200,000',
      description: 'Drive data-driven decision making through advanced analytics and machine learning.',
      match: 78,
      industry: 'technology'
    },
    {
      id: 6,
      title: 'Cloud Solutions Architect',
      skills: ['AWS', 'DevOps', 'Microservices', 'Architecture'],
      keySkills: ['AWS', 'Docker', 'Kubernetes', 'Microservices', 'DevOps'],
      salaryRange: '$130,000 - $190,000',
      description: 'Design and implement scalable cloud solutions for enterprise clients.',
      match: 58,
      industry: 'technology'
    }
  ];

  // Filter jobs based on selected criteria
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.keySkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = selectedIndustry === 'all' || job.industry === selectedIndustry;
    
    let matchesSalary = true;
    if (salaryRange !== 'all') {
      const salaryNum = parseInt(job.salaryRange.split('$')[1].split(',')[0]);
      switch (salaryRange) {
        case '50-100': matchesSalary = salaryNum >= 50 && salaryNum <= 100; break;
        case '100-150': matchesSalary = salaryNum >= 100 && salaryNum <= 150; break;
        case '150+': matchesSalary = salaryNum >= 150; break;
      }
    }
    
    return matchesSearch && matchesIndustry && matchesSalary;
  });

  const StatCard = ({ icon, title, value, change, color }) => (
    <div className="bg-gradient-to-r from-red-100 to-violet-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} />
          <span className="ml-1 text-sm font-medium">{change}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mt-4">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );

  // Exact Job Card matching the design from image
  const JobCard = ({ job }) => (
    <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 relative w-full">
      {/* Match percentage badge */}
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          job.match >= 70 ? 'bg-green-100 text-green-700' : 
          job.match >= 50 ? 'bg-yellow-100 text-yellow-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {job.match}% Match
        </span>
      </div>

      {/* Skills tags at top */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-200">
            {skill}
          </span>
        ))}
      </div>

      {/* Job title and link */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{job.title}</h3>
        <button className="bg-blue-400 rounded-3xl p-3 text-white hover:text-blue-300 text-sm flex items-center">
          View Similar Jobs & details <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Salary Range */}
      <div className="mb-4">
        <h4 className="text-gray-900 font-medium mb-1">Salary Range</h4>
        <p className="text-green-600 font-semibold text-lg">{job.salaryRange}</p>
      </div>

      {/* Description */}
      <div className="mb-4">
        <h4 className="text-gray-900 font-medium mb-1">Description</h4>
        <p className="text-gray-600">{job.description}</p>
      </div>

      {/* Key Skills */}
      <div>
        <h4 className="text-gray-900 font-medium mb-2">Key Skills</h4>
        <div className="flex flex-wrap gap-2">
          {job.keySkills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-200">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-200 to-blue-100 p-0 m-0">
      <div className=" px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-8 pt-0">
          <h1 className="text-4xl  bg-clip-text text-transparent">
            Labour Market Integration
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real-time job market analysis with intelligent career pathway recommendations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="text-white " size={24} />}
            title="Job Market Growth"
            value="12.5%"
            change={8.2}
            color="bg-gradient-to-br from-green-400 to-green-600"
          />
          <StatCard
            icon={<Users className="text-white" size={24} />}
            title="Skills Gap Index"
            value="42.3%"
            change={-5.1}
            color="bg-gradient-to-br from-orange-400 to-red-500"
          />
          <StatCard
            icon={<Briefcase className="text-white" size={24} />}
            title="Active Job Posts"
            value="25.8K"
            change={15.3}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
          />
          <StatCard
            icon={<Zap className="text-white" size={24} />}
            title="High-Demand Roles"
            value="156"
            change={22.7}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-r from-blue-100 to-violet-100 rounded-xl shadow-lg mb-8 w-full">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'trends', label: 'Market Trends', icon: TrendingUp },
              { id: 'skills', label: 'Skills Gap Analysis', icon: Users },
              { id: 'jobs', label: 'Job Recommendations', icon: Briefcase }
            ].map(tab => {
              const Icon = tab.icon;
              // Highlight Market Trends button with a custom color
              const isTrends = tab.id === 'trends';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium transition-all duration-300 rounded-3xl${
                    activeTab === tab.id
                      ? isTrends
                        ? 'border-b-2 border-blue-400 text-blue-400 bg-blue-50'
                        : 'border-b-2 border-purple-400 text-purple-400 bg-purple-50'
                      : isTrends
                        ? 'text-blue-400 hover:text-blue-400 hover:bg-blue-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Icon size={20} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 ">
            {activeTab === 'trends' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Demand Trends</h3>
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 w-full">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="evTech" stroke="#8b5cf6" strokeWidth={3} name="EV Technology" />
                          <Line type="monotone" dataKey="aiml" stroke="#06b6d4" strokeWidth={3} name="AI/ML" />
                          <Line type="monotone" dataKey="renewable" stroke="#10b981" strokeWidth={3} name="Renewable Energy" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Industry Distribution</h3>
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 w-full">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={industryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {industryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Real-time Skills Gap Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={skillsGapData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="demand" fill="#8b5cf6" name="Demand" />
                      <Bar dataKey="supply" fill="#06b6d4" name="Supply" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {skillsGapData.map((skill, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-300 to-violet-300 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{skill.skill}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Gap Size:</span>
                          <span className="font-semibold text-red-600">{skill.gap}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${skill.gap}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div>
                {/* Search and Filters */}
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search jobs, companies, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Filter size={20} className="mr-2" />
                      Filters
                      <ChevronDown size={20} className={`ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  
                  {showFilters && (
                    <div className="mt-4 p-4 bg-violet-100 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Industries</option>
                        <option value="technology">Technology</option>
                        <option value="automotive">Automotive</option>
                        <option value="renewable">Renewable Energy</option>
                        <option value="healthcare">Healthcare</option>
                      </select>
                      
                      <select
                        value={salaryRange}
                        onChange={(e) => setSalaryRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Salaries</option>
                        <option value="50-100">$50k - $100k</option>
                        <option value="100-150">$100k - $150k</option>
                        <option value="150+">$150k+</option>
                      </select>
                      
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Levels</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Results Summary */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {filteredJobs.length} Job Recommendations
                  </h3>
                  <div className="text-sm text-gray-500">
                    Sorted by match percentage
                  </div>
                </div>

                {/* Job Cards - Full width */}
                <div className="w-full">
                  {filteredJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Briefcase size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Box */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white w-full h-52">
          <div className="flex items-center mb-4">
            <Zap className="mr-3" size={24} />
            <h3 className="text-xl font-bold">AI Career Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🚗 EV Technology Surge</h4>
              <p className="text-purple-100">
                Demand for EV technicians increased 105% this quarter. Perfect opportunity for mechanical engineers to transition.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🤖 AI/ML Expansion</h4>
              <p className="text-purple-100">
                Machine learning roles showing 108% growth. High-paying positions available across all experience levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourMarketIntegration;