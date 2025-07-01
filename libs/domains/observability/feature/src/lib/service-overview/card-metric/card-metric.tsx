interface CardMetricProps {
  title: string
  value: string | number
  unit?: string
  status: 'HEALTHY' | 'WARNING' | 'ERROR'
  description?: string
}

export function CardMetric({ title, value, unit, status, description }: CardMetricProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'HEALTHY':
        return 'green'
      case 'WARNING':
        return 'yellow'
      case 'ERROR':
        return 'red'
      default:
        return 'neutral'
    }
  }

  const getStatusDot = () => {
    const color = getStatusColor()
    const dotClasses = {
      green: 'bg-green-500 border-green-200',
      yellow: 'bg-yellow-500 border-yellow-200',
      red: 'bg-red-500 border-red-200',
      neutral: 'bg-neutral-500 border-neutral-200',
    }

    return (
      <div className={`box-content h-2 w-2 rounded-full border-2 ${dotClasses[color as keyof typeof dotClasses]}`} />
    )
  }

  return (
    <div className="rounded border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
            {getStatusDot()}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-neutral-400">{value}</span>
            {unit && <span className="text-sm text-neutral-400">{unit}</span>}
          </div>
          {description && <p className="mt-1 text-xs text-neutral-400">{description}</p>}
        </div>
      </div>
    </div>
  )
}

export default CardMetric
