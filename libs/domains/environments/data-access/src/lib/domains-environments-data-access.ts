import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import { EnvironmentMainCallsApi } from 'qovery-typescript-axios'
import { type RunningState } from '@qovery/shared/enums'

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
    queryFn(): { state: RunningState } | null {
      return null
    },
  }),
  detail: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentMainCallsApi.getEnvironment(environmentId)
      return result.data
    },
  }),
})

export const mutations = {}

export type ServicesKeys = inferQueryKeys<typeof environments>
