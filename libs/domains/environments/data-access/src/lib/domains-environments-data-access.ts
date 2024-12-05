import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  type CloneEnvironmentRequest,
  type CreateEnvironmentRequest,
  DatabasesApi,
  DeploymentStageMainCallsApi,
  type DeploymentStageRequest,
  type DeploymentStageWithServicesStatuses,
  type DockerfileCheckRequest,
  EnvironmentActionsApi,
  EnvironmentApi,
  EnvironmentDeploymentHistoryApi,
  EnvironmentDeploymentRuleApi,
  type EnvironmentDeploymentRuleEditRequest,
  type EnvironmentEditRequest,
  EnvironmentExportApi,
  EnvironmentMainCallsApi,
  type EnvironmentStatus,
  EnvironmentsApi,
  LifecycleTemplateMainCallsApi,
} from 'qovery-typescript-axios'
import { type RunningState } from '@qovery/shared/enums'

const environmentsApi = new EnvironmentsApi()
const environmentApi = new EnvironmentApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()
const environmentActionApi = new EnvironmentActionsApi()
const environmentExportApi = new EnvironmentExportApi()
const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()
const databasesApi = new DatabasesApi()
const deploymentStageMainCallApi = new DeploymentStageMainCallsApi()
const lifecycleTemplateMainCallsApi = new LifecycleTemplateMainCallsApi()

export const environments = createQueryKeys('environments', {
  // NOTE: Value is set by WebSocket
  deploymentStatus: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return new Promise<EnvironmentStatus | null>(() => {})
    },
  }),
  // NOTE: Value is set by WebSocket
  deploymentStages: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return new Promise<DeploymentStageWithServicesStatuses[] | null>(() => {})
    },
  }),
  // NOTE: Value is set by WebSocket
  runningStatus: (environmentId: string) => ({
    queryKey: [environmentId],
    queryFn() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return new Promise<{ state: RunningState } | null>(() => {})
    },
  }),
  details: ({ environmentId }: { environmentId: string }) => ({
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
  list: ({ projectId }: { projectId: string }) => ({
    queryKey: [projectId],
    async queryFn() {
      const result = await environmentsApi.listEnvironment(projectId)
      return result.data.results
    },
  }),
  listDeploymentStages: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await deploymentStageMainCallApi.listEnvironmentDeploymentStage(environmentId)
      return result.data.results
    },
  }),
  deploymentHistory: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(environmentId)
      return result.data.results
    },
  }),
  deploymentHistoryV2: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentDeploymentsApi.listEnvironmentDeploymentHistoryV2(environmentId)
      return result.data.results
    },
  }),
  listDatabaseConfigurations: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await databasesApi.listEnvironmentDatabaseConfig(environmentId)
      return result.data.results
    },
  }),
  deploymentRule: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
      return result.data
    },
  }),
  listLifecycleTemplates: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await lifecycleTemplateMainCallsApi.listEnvironmentLifecycleTemplates(environmentId)
      return result.data.results
    },
  }),
  lifecycleTemplate: ({ environmentId, templateId }: { environmentId: string; templateId: string }) => ({
    queryKey: [environmentId, templateId],
    async queryFn() {
      const result = await lifecycleTemplateMainCallsApi.getEnvironmentLifecycleTemplate(environmentId, templateId)
      return result.data
    },
  }),
})

export const mutations = {
  async createEnvironment({ projectId, payload }: { projectId: string; payload: CreateEnvironmentRequest }) {
    const result = await environmentsApi.createEnvironment(projectId, payload)
    return result.data
  },
  async editEnvironment({ environmentId, payload }: { environmentId: string; payload: EnvironmentEditRequest }) {
    const result = await environmentMainCallsApi.editEnvironment(environmentId, payload)
    return result.data
  },
  async cloneEnvironment({ environmentId, payload }: { environmentId: string; payload: CloneEnvironmentRequest }) {
    const result = await environmentActionApi.cloneEnvironment(environmentId, payload)
    return result.data
  },
  async deployEnvironment({ environmentId }: { environmentId: string }) {
    const result = await environmentActionApi.deployEnvironment(environmentId)
    return result.data
  },
  async stopEnvironment({ environmentId }: { environmentId: string }) {
    const result = await environmentActionApi.stopEnvironment(environmentId)
    return result.data
  },
  async cancelDeploymentEnvironment({ environmentId }: { environmentId: string }) {
    const result = await environmentActionApi.cancelEnvironmentDeployment(environmentId, { force_cancel: false })
    return result.data
  },
  async deleteEnvironment({ environmentId }: { environmentId: string }) {
    const result = await environmentMainCallsApi.deleteEnvironment(environmentId)
    return result.data
  },
  async exportTerraform({ environmentId, exportSecrets }: { environmentId: string; exportSecrets: boolean }) {
    const result = await environmentExportApi.exportEnvironmentConfigurationIntoTerraform(
      environmentId,
      exportSecrets,
      {
        responseType: 'blob',
      }
    )
    return result.data
  },
  async attachServiceToDeploymentStage({
    stageId,
    serviceId,
  }: {
    prevStage?: { serviceId: string; stageId: string }
    stageId: string
    serviceId: string
  }) {
    const result = await deploymentStageMainCallApi.attachServiceToDeploymentStage(stageId, serviceId)
    return result.data.results
  },
  async moveDeploymentStage({
    after,
    stageId,
    targetStageId,
  }: {
    after: boolean
    stageId: string
    targetStageId: string
  }) {
    let result
    if (after) {
      result = await deploymentStageMainCallApi.moveAfterDeploymentStage(stageId, targetStageId)
    } else {
      result = await deploymentStageMainCallApi.moveBeforeDeploymentStage(stageId, targetStageId)
    }
    return result.data.results
  },
  async createDeploymentStage({ environmentId, payload }: { environmentId: string; payload: DeploymentStageRequest }) {
    const result = await deploymentStageMainCallApi.createEnvironmentDeploymentStage(environmentId, payload)
    return result.data
  },
  async editDeploymentStage({ stageId, payload }: { stageId: string; payload: DeploymentStageRequest }) {
    const result = await deploymentStageMainCallApi.editDeploymentStage(stageId, payload)
    return result.data
  },
  async deleteDeploymentStage({ stageId }: { stageId: string }) {
    const result = await deploymentStageMainCallApi.deleteDeploymentStage(stageId)
    return result.data
  },
  async editDeploymentRule({
    environmentId,
    deploymentRuleId,
    payload,
  }: {
    environmentId: string
    deploymentRuleId: string
    payload: EnvironmentDeploymentRuleEditRequest
  }) {
    const result = await environmentDeploymentRulesApi.editEnvironmentDeploymentRule(
      environmentId,
      deploymentRuleId,
      payload
    )
    return result.data
  },
  async checkDockerfile({
    environmentId,
    dockerfileCheckRequest,
  }: {
    environmentId: string
    dockerfileCheckRequest: DockerfileCheckRequest
  }) {
    const result = await environmentApi.checkDockerfile(environmentId, dockerfileCheckRequest)
    return result.data
  },
}

export type EnvironmentsKeys = inferQueryKeys<typeof environments>
