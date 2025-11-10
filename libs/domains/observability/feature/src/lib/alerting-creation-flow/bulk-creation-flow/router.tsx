import { type ReactNode } from 'react'
import { MetricConfigurationStep } from './metric-configuration-step/metric-configuration-step'
import { SummaryStep } from './summary-step/summary-step'

export interface RouteType {
  path: string
  component: ReactNode
}

export const ALERTING_CREATION_METRIC = (metricIndex = ':metricIndex') => `/metric/${metricIndex}`
export const ALERTING_CREATION_EDIT = (alertId = ':alertId') => `/edit/${alertId}`
export const ALERTING_CREATION_SUMMARY = '/summary'

export const ROUTER_ALERTING_CREATION: RouteType[] = [
  {
    path: ALERTING_CREATION_METRIC(),
    component: <MetricConfigurationStep />,
  },
  {
    path: ALERTING_CREATION_EDIT(),
    component: <MetricConfigurationStep />,
  },
  {
    path: ALERTING_CREATION_SUMMARY,
    component: <SummaryStep />,
  },
]
