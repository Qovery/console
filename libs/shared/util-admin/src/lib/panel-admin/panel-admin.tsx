import { useCallback, useEffect, useState } from 'react'
import { useUserRole } from '@qovery/shared/iam/feature'
import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { useApplicationMetrics } from '../hooks/use-application-metrics/use-application-metrics'
import { ListFeatureFlag } from '../list-feature-flag/list-feature-flag'

const MetricItem = ({
  label,
  value,
  unit,
  status,
  description,
}: {
  label: string
  value: string
  unit: string
  status: string
  description: string
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-brand-600'
    }
  }

  return (
    <div className="flex gap-2 text-xs">
      <Tooltip content={description}>
        <span className="font-medium text-neutral-350">{label}</span>
      </Tooltip>
      <span className={getStatusColor()}>
        {value}
        {unit}
      </span>
    </div>
  )
}

export function hasPanelAdmin() {
  return localStorage.getItem('admin-panel-hidden') === 'true'
}

export function PanelAdmin() {
  const { metrics } = useApplicationMetrics()

  const [hidePanel, setHidePanel] = useState(() => {
    const stored = localStorage.getItem('admin-panel-hidden')
    return stored ? JSON.parse(stored) : false
  })

  const { isQoveryAdminUser } = useUserRole()

  const togglePanel = useCallback(() => {
    setHidePanel((prev: boolean) => {
      const newState = !prev
      localStorage.setItem('admin-panel-hidden', JSON.stringify(newState))
      return newState
    })
  }, [])

  // Hide panel on CTRL+D
  useEffect(() => {
    if (!isQoveryAdminUser) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        togglePanel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isQoveryAdminUser, togglePanel])

  if (!isQoveryAdminUser) {
    return null
  }

  return !hidePanel ? (
    <div className="sticky bottom-0 flex h-8 w-full items-center justify-between gap-3 border-t border-neutral-200 bg-white px-4 font-code">
      <div className="flex items-center gap-10">
        <Button variant="outline" size="xs" onClick={togglePanel} className="w-6 max-w-6 justify-center p-0">
          <Icon iconName="xmark" iconStyle="regular" />
        </Button>
        <MetricItem
          label="Jank"
          description="Percentage of frames dropped"
          value={metrics.jank.toString()}
          unit="%"
          status={metrics.jank > 10 ? 'error' : 'good'}
        />
        <MetricItem
          label="Delay"
          description="Average network and processing delays in ms"
          value={metrics.delay.toString()}
          unit="ms"
          status={metrics.delay > 100 ? 'error' : 'good'}
        />
        <MetricItem
          label="Req"
          description="Number of active network requests"
          value={metrics.net.toString()}
          unit="req"
          status={metrics.net > 10 ? 'error' : 'good'}
        />
        <MetricItem
          label="Mem"
          description="Memory usage in GB"
          value={metrics.mem.toString()}
          unit="GB"
          status={metrics.mem > 1 ? 'error' : 'good'}
        />
      </div>
      <ListFeatureFlag />
    </div>
  ) : null
}

export default PanelAdmin
