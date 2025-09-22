import { useState, useEffect } from 'react'
import { apiEndpoints } from '../api'

const TrainerDashboard = () => {
  const [trainerData, setTrainerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrainerData()
  }, [])

  const fetchTrainerData = async () => {
    try {
      setLoading(true)
      // This would typically fetch specific trainer data
      // For demo purposes, we'll simulate data
      setTimeout(() => {
        setTrainerData({
          id: 1,
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@example.com",
          specialization: ["Data Science", "Machine Learning"],
          courses_teaching: ["Data Science Fundamentals", "Advanced Analytics"],
          students_count: 45,
          upcomingClasses: [
            { date: "2024-01-16", time: "10:00 AM", course: "Data Science Fundamentals", students: 25 },
            { date: "2024-01-17", time: "2:00 PM", course: "Advanced Analytics", students: 20 },
            { date: "2024-01-18", time: "11:00 AM", course: "Machine Learning Basics", students: 18 }
          ],
          recentFeedback: [
            { student: "John Doe", rating: 5, comment: "Excellent explanation of concepts!" },
            { student: "Jane Smith", rating: 4, comment: "Very helpful and engaging." },
            { student: "Mike Wilson", rating: 5, comment: "Clear and well-structured lessons." }
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
        <h2 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your courses and track student progress
        </p>
      </div>

      {/* Profile Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-lg">
                {trainerData?.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{trainerData?.name}</h3>
              <p className="text-gray-500">{trainerData?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{trainerData?.students_count}</div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specializations */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {trainerData?.specialization?.map((spec, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Teaching Courses */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Teaching Courses</h3>
          <ul className="space-y-2">
            {trainerData?.courses_teaching?.map((course, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                {course}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Classes</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainerData?.upcomingClasses?.map((class_item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{class_item.date}</div>
                      <div className="text-gray-500">{class_item.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {class_item.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {class_item.students} enrolled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Student Feedback</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {trainerData?.recentFeedback?.map((feedback, index) => (
            <li key={index} className="px-6 py-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {feedback.student.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {feedback.student}
                    </p>
                    <div className="flex items-center">
                      {[...Array(feedback.rating)].map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    "{feedback.comment}"
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TrainerDashboard