'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Insight {
  type: string
  title: string
  description: string
  priority: string
}

export default function InsightsSidebar() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/insights`)
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="text-red-600" size={20} />
      case 'warning':
        return <AlertCircle className="text-orange-600" size={20} />
      default:
        return <Info className="text-blue-600" size={20} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-300 bg-red-50'
      case 'Medium':
        return 'border-orange-300 bg-orange-50'
      default:
        return 'border-blue-300 bg-blue-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-yellow-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Actionable Insights</h2>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading insights...</p>
      ) : insights.length === 0 ? (
        <p className="text-gray-600">No insights available</p>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                    <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">Policy Recommendations</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Prioritize device upgrades in high-risk zones</li>
          <li>• Promote iris authentication for elderly users</li>
          <li>• Implement seasonal awareness campaigns</li>
          <li>• Review device model performance quarterly</li>
        </ul>
      </div>
    </div>
  )
}

