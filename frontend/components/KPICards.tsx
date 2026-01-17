'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Smartphone, Users, TrendingUp } from 'lucide-react'

interface KPICardsProps {
  data: {
    overall_failure_rate: number
    highest_risk_district: string
    worst_device: string
    elderly_failure_delta: number
    seasonal_spike: number
  }
}

export default function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: 'Overall Failure Rate',
      value: `${data.overall_failure_rate}%`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Highest Risk District',
      value: data.highest_risk_district,
      icon: MapPin,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Worst Device',
      value: data.worst_device,
      icon: Smartphone,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Elderly Failure Delta',
      value: `+${data.elderly_failure_delta}%`,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Seasonal Spike',
      value: `+${data.seasonal_spike}%`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bgColor} rounded-lg p-6 shadow-md border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`${card.color} text-white p-2 rounded-lg`} size={32} />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

