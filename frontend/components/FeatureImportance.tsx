'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Brain } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FeatureImportance() {
  const [features, setFeatures] = useState<any[]>([])

  useEffect(() => {
    fetchFeatureImportance()
  }, [])

  const fetchFeatureImportance = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/feature-importance`)
      const data = await response.json()
      setFeatures(data.features || [])
    } catch (error) {
      console.error('Error fetching feature importance:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-purple-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Feature Importance & Explainability</h2>
      </div>

      {features.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={features} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="importance" fill="#8b5cf6" name="Importance Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Loading feature importance data...</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">Understanding Feature Importance</h3>
        <p className="text-sm text-gray-600">
          This chart shows which factors contribute most to biometric authentication failures.
          Higher importance scores indicate stronger correlation with failure rates.
        </p>
      </div>
    </div>
  )
}

