import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export interface LogFilters {
  serviceId: string
  level?: string
  instance?: string
  message?: string
  version?: string
  container?: string
  namespace?: string
  search?: string
}

export function buildLokiQuery(filters: LogFilters): string {
  const labels: string[] = [`qovery_com_service_id="${filters.serviceId}"`]

  if (filters.level) {
    labels.push(`level="${filters.level}"`)
  }

  if (filters.instance) {
    labels.push(`pod="${filters.instance}"`)
  }

  if (filters.container) {
    labels.push(`container="${filters.container}"`)
  }

  if (filters.namespace) {
    labels.push(`namespace="${filters.namespace}"`)
  }

  if (filters.version) {
    labels.push(`app="${filters.version}"`)
  }

  let query = `{${labels.join(', ')}}`

  if (filters.message) {
    query += ` |= "${filters.message}"`
  } else if (filters.search) {
    query += ` |= "${filters.search}"`
  }

  return query
}

interface StreamLabels {
  // Common labels
  job: string
  level?: string
  qovery_com_service_id: string
  qovery_com_environment_id?: string
  qovery_com_service_type?: string

  // For OTLP streams
  exporter?: string

  // For file-based streams
  app?: string
  container?: string
  filename?: string
  namespace?: string
  node_name?: string
  pod?: string
  stream?: string
}

export interface LogStream {
  stream: StreamLabels
  values: [string, string][] // Array of [timestamp, message] tuples
}

export interface LokiResponse {
  status: string
  data: {
    resultType: string
    result: LogStream[]
  }
}

export interface ServiceLog extends StreamLabels {
  timestamp: string
  message: string
}

// Common normalized log interface for both live and history logs
export interface NormalizedServiceLog {
  timestamp: string
  message: string
  instance?: string
  container?: string
  exporter?: string
  level?: string
  version?: string
}

function formatLogs(logs: LogStream[]): ServiceLog[] {
  return logs.flatMap((log) => {
    const stream = log.stream
    const values = log.values

    return values.map((value) => {
      const timestampStr = value[0] ?? ''
      const timestampNum = Number(timestampStr)
      // Convert nanoseconds to milliseconds if timestamp has more than 13 digits
      const convertedTimestamp = timestampNum > 9999999999999 ? Math.floor(timestampNum / 1000000) : timestampNum

      return {
        ...stream,
        timestamp: convertedTimestamp.toString(),
        message: value[1],
      }
    })
  })
}

// Normalize ServiceLog (API) to common format
export function normalizeServiceLog(log: ServiceLog): NormalizedServiceLog {
  return {
    timestamp: log.timestamp,
    message: log.message,
    instance: log.pod,
    container: log.container,
    exporter: log.exporter,
    level: log.level ?? 'UNKNOWN',
    version: log.app, // API uses 'app' field for version
  }
}

// Normalize ServiceLogResponseDto (WebSocket) to common format
export function normalizeWebSocketLog(log: {
  created_at?: number
  message?: string
  pod_name?: string
  container_name?: string
  severity_text?: string
  version?: string
}): NormalizedServiceLog {
  return {
    timestamp: log.created_at?.toString() || '',
    message: log.message || '',
    instance: log.pod_name,
    container: log.container_name,
    exporter: undefined, // WebSocket logs don't have exporter
    level: log.severity_text ?? 'UNKNOWN',
    version: log.version,
  }
}

export const serviceLogs = createQueryKeys('serviceLogs', {
  serviceLogs: ({
    clusterId,
    serviceId,
    startDate,
    endDate,
    timeRange,
    filters,
    limit,
    direction,
  }: {
    clusterId: string
    serviceId: string
    startDate?: Date
    endDate?: Date
    timeRange?: string
    filters?: Omit<LogFilters, 'serviceId'>
    limit?: number
    direction?: 'forward' | 'backward'
  }) => ({
    queryKey: [clusterId, timeRange, startDate, endDate, serviceId, filters, limit, direction],
    async queryFn() {
      // Convert Date objects to nanosecond Unix epoch format for Loki API
      // https://grafana.com/docs/loki/latest/reference/loki-http-api/#timestamps
      const startTimestamp = startDate ? (startDate.getTime() * 1000000).toString() : undefined
      const endTimestamp = endDate ? (endDate.getTime() * 1000000).toString() : undefined

      const query = buildLokiQuery({ serviceId, ...filters })

      const response = await clusterApi.getClusterLogs(
        clusterId,
        '/loki/api/v1/query_range',
        query,
        startTimestamp,
        endTimestamp,
        limit?.toString(),
        undefined,
        undefined,
        undefined,
        direction || 'forward'
      )

      if (response.data.response) {
        try {
          const parsedResponse =
            typeof response.data.response === 'string' ? JSON.parse(response.data.response) : response.data.response

          const result = parsedResponse.data.result as LogStream[]

          if (result.length > 0) {
            return formatLogs(result)
          }

          return []
        } catch (error) {
          console.error('Failed to parse Loki response:', error)
          return []
        }
      }

      return []
    },
  }),
})
