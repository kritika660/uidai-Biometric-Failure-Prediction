'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function PredictionPanel() {
  const [formData, setFormData] = useState({
    age_group: 'adult',
    biometric_type: 'fingerprint',
    device_model: 'UIDAI_Device_A',
    state: 'Maharashtra',
  })
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      console.error('Error predicting:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-500'
      case 'Medium':
        return 'bg-yellow-500'
      case 'High':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Failure Prediction</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age Group
          </label>
          <select
            value={formData.age_group}
            onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="young">Young</option>
            <option value="adult">Adult</option>
            <option value="elderly">Elderly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biometric Type
          </label>
          <select
            value={formData.biometric_type}
            onChange={(e) => setFormData({ ...formData, biometric_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="fingerprint">Fingerprint</option>
            <option value="iris">Iris</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device Model
          </label>
          <select
            value={formData.device_model}
            onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="UIDAI_Device_A">Device A</option>
            <option value="UIDAI_Device_B">Device B</option>
            <option value="UIDAI_Device_C">Device C</option>
            <option value="UIDAI_Device_D">Device D</option>
            <option value="UIDAI_Device_E">Device E</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Bihar">Bihar</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Kerala">Kerala</option>
          </select>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Predicting...' : 'Predict Failure Probability'}
      </button>

      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Prediction Result</h3>
            <div className={`${getRiskColor(prediction.risk_level)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {prediction.risk_level} Risk
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Failure Probability</span>
              <span className="text-2xl font-bold text-gray-900">
                {prediction.failure_probability}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${getRiskColor(prediction.risk_level)} h-3 rounded-full transition-all`}
                style={{ width: `${Math.min(prediction.failure_probability, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

