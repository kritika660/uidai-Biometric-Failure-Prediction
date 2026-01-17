'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function TrendsChart() {
  const [trends, setTrends] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'monthly' | 'age' | 'device'>('monthly')

  useEffect(() => {
    fetchTrends()
  }, [])

  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/trends`)
      const data = await response.json()
      setTrends(data)
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  if (!trends) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <p className="text-gray-600">Loading trends...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Trends & Analysis</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab('age')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'age'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Age Groups
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'device'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Devices
          </button>
        </div>
      </div>

      <div className="h-80">
        {activeTab === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="failure_rate" stroke="#ef4444" strokeWidth={2} name="Failure Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'age' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.age_groups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age_group" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="failure_rate" fill="#f59e0b" name="Failure Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'device' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.devices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="failure_rate" fill="#8b5cf6" name="Failure Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

