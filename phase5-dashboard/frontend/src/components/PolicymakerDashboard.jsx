import { useState, useEffect } from 'react'
import { apiEndpoints } from '../api'

const PolicymakerDashboard = () => {
  const [policymakerData, setPolicymakerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPolicymakerData()
  }, [])

  const fetchPolicymakerData = async () => {
    try {
      setLoading(true)
      // This would typically fetch specific policymaker data
      // For demo purposes, we'll simulate data
      setTimeout(() => {
        setPolicymakerData({
          id: 1,
          name: "Michael Brown",
          department: "Education Technology",
          email: "michael.brown@gov.example.com",
          policies_managed: ["Digital Skills Framework", "Training Standards"],
          analytics: {
            totalLearners: 1250,
            totalTrainers: 85,
            completionRate: 78,
            satisfactionScore: 4.3
          },
          recentPolicies: [
            { 
              id: 1, 
              title: "Digital Skills Framework 2024", 
              status: "Active", 
              lastUpdated: "2024-01-10",
              impact: "1,200 learners affected"
            },
            { 
              id: 2, 
              title: "Training Quality Standards", 
              status: "Under Review", 
              lastUpdated: "2024-01-08",
              impact: "85 trainers affected"
            },
            { 
              id: 3, 
              title: "Assessment Guidelines", 
              status: "Draft", 
              lastUpdated: "2024-01-05",
              impact: "All programs affected"
            }
          ],
          trendsData: [
            { month: "Sep", learners: 1100, completion: 75 },
            { month: "Oct", learners: 1180, completion: 76 },
            { month: "Nov", learners: 1220, completion: 77 },
            { month: "Dec", learners: 1250, completion: 78 }
          ]
        })
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Policymaker Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Monitor program effectiveness and manage educational policies
        </p>
      </div>

      {/* Profile Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-lg">
              {policymakerData?.name?.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{policymakerData?.name}</h3>
            <p className="text-gray-500">{policymakerData?.department}</p>
            <p className="text-gray-500 text-sm">{policymakerData?.email}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {policymakerData?.analytics?.totalLearners?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Learners</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {policymakerData?.analytics?.totalTrainers}
              </div>
              <div className="text-sm text-gray-500">Active Trainers</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {policymakerData?.analytics?.completionRate}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {policymakerData?.analytics?.satisfactionScore}
              </div>
              <div className="text-sm text-gray-500">Satisfaction Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Managed Policies */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Managed Policies</h3>
          <div className="flex flex-wrap gap-2">
            {policymakerData?.policies_managed?.map((policy, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
              >
                {policy}
              </span>
            ))}
          </div>
        </div>

        {/* Growth Trends */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Trends</h3>
          <div className="space-y-4">
            {policymakerData?.trendsData?.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{data.learners} learners</span>
                  <span className="text-sm text-green-600">{data.completion}% completion</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Policies */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Policy Updates</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policymakerData?.recentPolicies?.map((policy) => (
                <tr key={policy.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {policy.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      policy.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : policy.status === 'Under Review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PolicymakerDashboard