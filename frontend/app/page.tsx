'use client'

import { useEffect, useState } from 'react'
import KPICards from '@/components/KPICards'
import RiskZoneMap from '@/components/RiskZoneMap'
import PredictionPanel from '@/components/PredictionPanel'
import TrendsChart from '@/components/TrendsChart'
import FeatureImportance from '@/components/FeatureImportance'
import InsightsSidebar from '@/components/InsightsSidebar'
import { motion } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKPIs()
  }, [])

  const fetchKPIs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/kpis`)
      const data = await response.json()
      setKpis(data)
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            UIDAI Biometric Intelligence Dashboard
          </h1>
          <p className="text-gray-600">
            Failure Prediction & Risk Zone Analysis
          </p>
        </motion.div>

        {/* KPI Cards */}
        {!loading && kpis && <KPICards data={kpis} />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Map and Prediction */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RiskZoneMap />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PredictionPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TrendsChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <FeatureImportance />
            </motion.div>
          </div>

          {/* Right Column - Insights Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <InsightsSidebar />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

