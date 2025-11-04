import { type ReactNode } from 'react'
import { MetricConfigurationStep } from './metric-configuration-step/metric-configuration-step'
import { SummaryStep } from './summary-step/summary-step'

export interface RouteType {
  path: string
  component: ReactNode
}

export const ROUTER_ALERTING_CREATION: RouteType[] = [
  {
    path: '/metric/:metricIndex',
    component: <MetricConfigurationStep />,
  },
  {
    path: '/summary',
    component: <SummaryStep />,
  },
]
