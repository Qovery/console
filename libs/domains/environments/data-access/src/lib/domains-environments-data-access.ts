import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import { EnvironmentMainCallsApi, EnvironmentsApi } from 'qovery-typescript-axios'
import { type RunningState } from '@qovery/shared/enums'

const environmentsApi = new EnvironmentsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()

export const environments = createQueryKeys('environments', {
  // NOTE: Value is set by WebSocket
  deploymentStatus: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentMainCallsApi.getEnvironmentStatus(environmentId)
      return result.data
    },
  }),
  // NOTE: Value is set by WebSocket
  runningStatus: (environmentId: string) => ({
    queryKey: [environmentId],
    queryFn() {
      return new Promise<{ state: RunningState } | null>(() => {})
    },
  }),
  detail: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentMainCallsApi.getEnvironment(environmentId)
      return result.data
    },
  }),
  listStatuses: (projectId: string) => ({
    queryKey: [projectId],
    async queryFn() {
      const result = await environmentsApi.getProjectEnvironmentsStatus(projectId)
      return result.data.results ?? []
    },
  }),
})

export const mutations = {}

export type EnvironmentsKeys = inferQueryKeys<typeof environments>
