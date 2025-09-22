import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

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

function formatLogs(logs: LogStream[]): ServiceLog[] {
  return logs.flatMap((log) => {
    const stream = log.stream
    const values = log.values

    return values
      .map((value) => {
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
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
  })
}

export const serviceLogs = createQueryKeys('serviceLogs', {
  serviceLogs: ({
    clusterId,
    serviceId,
    startDate,
    endDate,
    timeRange,
  }: {
    clusterId: string
    serviceId: string
    startDate?: Date
    endDate?: Date
    timeRange?: string
  }) => ({
    queryKey: [clusterId, timeRange, startDate, endDate, serviceId],
    async queryFn() {
      // Convert Date objects to nanosecond Unix epoch format for Loki API
      // https://grafana.com/docs/loki/latest/reference/loki-http-api/#timestamps
      const startTimestamp = startDate ? (startDate.getTime() * 1000000).toString() : undefined
      const endTimestamp = endDate ? (endDate.getTime() * 1000000).toString() : undefined

      const response = await clusterApi.getClusterLogs(
        clusterId,
        '/loki/api/v1/query_range',
        `{qovery_com_service_id="${serviceId}"}`,
        startTimestamp,
        endTimestamp,
        undefined,
        undefined,
        undefined,
        undefined,
        'forward'
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
