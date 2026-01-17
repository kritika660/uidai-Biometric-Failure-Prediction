'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Simplified India map with states
const INDIA_STATES = [
  { name: 'Maharashtra', x: 50, y: 60 },
  { name: 'Delhi', x: 45, y: 25 },
  { name: 'Karnataka', x: 45, y: 75 },
  { name: 'Tamil Nadu', x: 50, y: 90 },
  { name: 'Gujarat', x: 30, y: 50 },
  { name: 'Rajasthan', x: 35, y: 35 },
  { name: 'West Bengal', x: 70, y: 50 },
  { name: 'Uttar Pradesh', x: 50, y: 40 },
  { name: 'Bihar', x: 60, y: 45 },
  { name: 'Punjab', x: 40, y: 25 },
  { name: 'Haryana', x: 42, y: 30 },
  { name: 'Kerala', x: 45, y: 85 },
]

export default function RiskZoneMap() {
  const [riskZones, setRiskZones] = useState<any[]>([])
  const [filter, setFilter] = useState({ biometric_type: '', age_group: '' })
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  useEffect(() => {
    fetchRiskZones()
  }, [filter])

  const fetchRiskZones = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.biometric_type) params.append('biometric_type', filter.biometric_type)
      if (filter.age_group) params.append('age_group', filter.age_group)
      
      const response = await fetch(`${API_BASE}/api/risk-zones?${params}`)
      const data = await response.json()
      setRiskZones(data.zones || [])
    } catch (error) {
      console.error('Error fetching risk zones:', error)
    }
  }

  const getFailureRate = (stateName: string) => {
    const zone = riskZones.find(z => z.state === stateName)
    return zone?.failure_rate || 0
  }

  const getRiskColor = (failureRate: number) => {
    if (failureRate < 10) return 'bg-green-400'
    if (failureRate < 20) return 'bg-yellow-400'
    if (failureRate < 30) return 'bg-orange-400'
    return 'bg-red-500'
  }

  const getRiskLevel = (failureRate: number) => {
    if (failureRate < 10) return 'Low'
    if (failureRate < 20) return 'Medium'
    if (failureRate < 30) return 'High'
    return 'Critical'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Risk Zone Mapping</h2>
        <div className="flex gap-2">
          <select
            value={filter.biometric_type}
            onChange={(e) => setFilter({ ...filter, biometric_type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Biometric Types</option>
            <option value="fingerprint">Fingerprint</option>
            <option value="iris">Iris</option>
          </select>
          <select
            value={filter.age_group}
            onChange={(e) => setFilter({ ...filter, age_group: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Age Groups</option>
            <option value="young">Young</option>
            <option value="adult">Adult</option>
            <option value="elderly">Elderly</option>
          </select>
        </div>
      </div>

      {/* Simplified Map Visualization */}
      <div className="relative bg-gray-100 rounded-lg p-8 h-96 overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {INDIA_STATES.map((state) => {
            const failureRate = getFailureRate(state.name)
            const color = getRiskColor(failureRate)
            const isHovered = hoveredState === state.name
            
            return (
              <g key={state.name}>
                <circle
                  cx={state.x}
                  cy={state.y}
                  r={isHovered ? 4 : 3}
                  fill={color}
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredState(state.name)}
                  onMouseLeave={() => setHoveredState(null)}
                />
                {isHovered && (
                  <text
                    x={state.x}
                    y={state.y - 6}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-900"
                  >
                    {state.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-semibold mb-2">Failure Rate</h3>
          <div className="flex gap-2 items-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>&lt;10%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>10-20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>20-30%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>&gt;30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* State Details */}
      {hoveredState && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <h3 className="font-semibold text-gray-900 mb-2">{hoveredState}</h3>
          {(() => {
            const zone = riskZones.find(z => z.state === hoveredState)
            if (!zone) return <p className="text-sm text-gray-600">No data available</p>
            return (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Failure Rate:</span>
                  <p className="font-semibold text-gray-900">{zone.failure_rate}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Attempts:</span>
                  <p className="font-semibold text-gray-900">{zone.total_attempts.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Risk Level:</span>
                  <p className="font-semibold text-gray-900">{getRiskLevel(zone.failure_rate)}</p>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}

