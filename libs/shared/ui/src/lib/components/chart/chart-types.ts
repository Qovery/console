export interface DataBreak {
  start: number
  end: number
  duration: number
  reason?: 'server_restart' | 'maintenance' | 'network_issue' | 'unknown'
}

export interface ChartDataPoint {
  timestamp: number
  time: string
  fullTime: string
  [key: string]: string | number | null
}
