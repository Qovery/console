import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationActionsApi,
  type ApplicationAdvancedSettings,
  ApplicationConfigurationApi,
  ApplicationDeploymentHistoryApi,
  ApplicationDeploymentRestrictionApi,
  type ApplicationDeploymentRestrictionRequest,
  type ApplicationEditRequest,
  ApplicationMainCallsApi,
  ApplicationsApi,
  ContainerActionsApi,
  type ContainerAdvancedSettings,
  ContainerConfigurationApi,
  ContainerDeploymentHistoryApi,
  ContainerMainCallsApi,
  type ContainerRequest,
  ContainersApi,
  DatabaseActionsApi,
  DatabaseDeploymentHistoryApi,
  type DatabaseEditRequest,
  DatabaseMainCallsApi,
  DatabasesApi,
  EnvironmentMainCallsApi,
  HelmActionsApi,
  type HelmAdvancedSettings,
  HelmConfigurationApi,
  HelmDeploymentHistoryApi,
  HelmDeploymentRestrictionApi,
  type HelmDeploymentRestrictionRequest,
  HelmMainCallsApi,
  type HelmRequest,
  HelmsApi,
  JobActionsApi,
  type JobAdvancedSettings,
  JobConfigurationApi,
  JobDeploymentHistoryApi,
  JobDeploymentRestrictionApi,
  type JobDeploymentRestrictionRequest,
  JobMainCallsApi,
  type JobRequest,
  JobsApi,
  type Status,
  type Application as _Application,
  type CloneServiceRequest as _CloneServiceRequest,
  type ContainerResponse as _Container,
  type Database as _Database,
  type HelmResponse as _Helm,
  type JobResponse as _Job,
} from 'qovery-typescript-axios'
import { type ApplicationStatusDto, type DatabaseStatusDto, type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'
import { type ServiceTypeEnum } from '@qovery/shared/enums'

const applicationsApi = new ApplicationsApi()
const containersApi = new ContainersApi()
const databasesApi = new DatabasesApi()
const jobsApi = new JobsApi()
const helmsApi = new HelmsApi()

const applicationMainCallsApi = new ApplicationMainCallsApi()
const containerMainCallsApi = new ContainerMainCallsApi()
const databaseMainCallsApi = new DatabaseMainCallsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const jobMainCallsApi = new JobMainCallsApi()
const helmMainCallsApi = new HelmMainCallsApi()

const applicationDeploymentRestrictionApi = new ApplicationDeploymentRestrictionApi()
const jobDeploymentRestrictionApi = new JobDeploymentRestrictionApi()
const helmDeploymentRestrictionApi = new HelmDeploymentRestrictionApi()

const applicationDeploymentsApi = new ApplicationDeploymentHistoryApi()
const containerDeploymentsApi = new ContainerDeploymentHistoryApi()
const databaseDeploymentsApi = new DatabaseDeploymentHistoryApi()
const helmDeploymentsApi = new HelmDeploymentHistoryApi()
const jobDeploymentsApi = new JobDeploymentHistoryApi()

const applicationActionsApi = new ApplicationActionsApi()
const containerActionsApi = new ContainerActionsApi()
const databaseActionsApi = new DatabaseActionsApi()
const helmActionsApi = new HelmActionsApi()
const jobActionsApi = new JobActionsApi()

const applicationConfigurationApi = new ApplicationConfigurationApi()
const containerConfigurationApi = new ContainerConfigurationApi()
const helmConfigurationApi = new HelmConfigurationApi()
const jobConfigurationApi = new JobConfigurationApi()

// Prefer this type in param instead of ServiceTypeEnum
// to suppport string AND enum as param.
// ServiceTypeEnum still exist mainly for compatibility reason (to use redux and react-query fetched services in data-access).
// It should be removed when we will be 100% relying on react-query.
export type ServiceType = keyof typeof ServiceTypeEnum

export type ApplicationType = Extract<ServiceType, 'APPLICATION'>
export type ContainerType = Extract<ServiceType, 'CONTAINER'>
export type DatabaseType = Extract<ServiceType, 'DATABASE'>
export type JobType = Extract<ServiceType, 'JOB'>
export type HelmType = Extract<ServiceType, 'HELM'>

export type Application = _Application & { serviceType: ApplicationType }
export type Database = _Database & { serviceType: DatabaseType }
export type Container = _Container & { serviceType: ContainerType }
export type Job = _Job & { serviceType: JobType }
export type Helm = _Helm & { serviceType: HelmType }

export type AnyService = Application | Database | Container | Job | Helm

export type AdvancedSettings =
  | ApplicationAdvancedSettings
  | ContainerAdvancedSettings
  | JobAdvancedSettings
  | HelmAdvancedSettings

export function isApplication(service: AnyService): service is Application {
  return service.serviceType === 'APPLICATION'
}

export function isContainer(service: AnyService): service is Container {
  return service.serviceType === 'CONTAINER'
}

export function isDatabase(service: AnyService): service is Database {
  return service.serviceType === 'DATABASE'
}

export function isJob(service: AnyService): service is Job {
  return service.serviceType === 'JOB'
}

export function isHelm(service: AnyService): service is Helm {
  return service.serviceType === 'HELM'
}

export const services = createQueryKeys('services', {
  deploymentStatus: (environmentId: string, serviceId: string) => ({
    queryKey: [environmentId, serviceId],
    // NOTE: Value is set by WebSocket
    queryFn() {
      return new Promise<Status | null>(() => {})
    },
  }),
  runningStatus: (environmentId: string, serviceId: string) => ({
    queryKey: [environmentId, serviceId],
    // NOTE: Value is set by WebSocket
    queryFn() {
      return new Promise<ApplicationStatusDto | DatabaseStatusDto | null>(() => {})
    },
  }),
  metrics: (environmentId: string, serviceId: string) => ({
    queryKey: [environmentId, serviceId],
    // NOTE: Value is set by WebSocket
    queryFn() {
      return new Promise<Array<ServiceMetricsDto> | null>(() => {})
    },
  }),
  listStatuses: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      const result = await environmentMainCallsApi.getEnvironmentStatuses(environmentId)
      return result.data
    },
  }),
  list: (environmentId: string) => ({
    queryKey: [environmentId],
    async queryFn() {
      return [
        ...((await applicationsApi.listApplication(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: 'APPLICATION' as const,
        })),
        ...((await containersApi.listContainer(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: 'CONTAINER' as const,
        })),
        ...((await databasesApi.listDatabase(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: 'DATABASE' as const,
        })),
        ...((await jobsApi.listJobs(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: 'JOB' as const,
        })),
        ...((await helmsApi.listHelms(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: 'HELM' as const,
        })),
      ]
    },
  }),
  status: ({ id: serviceId, serviceType }: { id: string; serviceType: ServiceType }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const fn = match(serviceType)
        .with('APPLICATION', () => applicationMainCallsApi.getApplicationStatus.bind(applicationMainCallsApi))
        .with('CONTAINER', () => containerMainCallsApi.getContainerStatus.bind(containerMainCallsApi))
        .with('DATABASE', () => databaseMainCallsApi.getDatabaseStatus.bind(databaseMainCallsApi))
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => jobMainCallsApi.getJobStatus.bind(jobMainCallsApi))
        .with('HELM', () => helmMainCallsApi.getHelmStatus.bind(helmMainCallsApi))
        .exhaustive()
      const response = await fn(serviceId)
      return response.data
    },
  }),
  deploymentRestrictions: ({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const fn = match(serviceType)
        .with('APPLICATION', () =>
          applicationDeploymentRestrictionApi.getApplicationDeploymentRestrictions.bind(
            applicationDeploymentRestrictionApi
          )
        )
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () =>
          jobDeploymentRestrictionApi.getJobDeploymentRestrictions.bind(jobDeploymentRestrictionApi)
        )
        .with('HELM', () =>
          helmDeploymentRestrictionApi.getHelmDeploymentRestrictions.bind(helmDeploymentRestrictionApi)
        )
        .with('CONTAINER', 'DATABASE', () => null)
        .exhaustive()
      if (!fn) {
        throw new Error(`deploymentRestrictions unsupported for serviceType: ${serviceType}`)
      }
      const response = await fn(serviceId)
      return response.data.results
    },
  }),
  details: ({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const service = await match(serviceType)
        .with('APPLICATION', async () => ({
          ...(await applicationMainCallsApi.getApplication(serviceId)).data,
          serviceType: 'APPLICATION' as const,
        }))
        .with('CONTAINER', async () => ({
          ...(await containerMainCallsApi.getContainer(serviceId)).data,
          serviceType: 'CONTAINER' as const,
        }))
        .with('DATABASE', async () => ({
          ...(await databaseMainCallsApi.getDatabase(serviceId)).data,
          serviceType: 'DATABASE' as const,
        }))
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', async () => ({
          ...(await jobMainCallsApi.getJob(serviceId)).data,
          serviceType: 'JOB' as const,
        }))
        .with('HELM', async () => ({
          ...(await helmMainCallsApi.getHelm(serviceId)).data,
          serviceType: 'HELM' as const,
        }))
        .exhaustive()
      return service
    },
  }),
  listCommits: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>
  }) => ({
    queryKey: [serviceId],
    async queryFn() {
      return match(serviceType)
        .with('APPLICATION', async () => {
          return (await applicationMainCallsApi.listApplicationCommit(serviceId)).data.results
        })
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', async () => {
          return (await jobMainCallsApi.listJobCommit(serviceId)).data.results
        })
        .with('HELM', async () => {
          // TODO: waiting for helmMainCallsApi.listHelmCommit
          return []
        })
        .exhaustive()
    },
  }),
  deploymentHistory: ({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) => ({
    queryKey: [serviceId],
    async queryFn() {
      return await match(serviceType)
        .with('APPLICATION', async () => ({
          ...(await applicationDeploymentsApi.listApplicationDeploymentHistory(serviceId)).data,
          serviceType: 'APPLICATION' as const,
        }))
        .with('CONTAINER', async () => ({
          ...(await containerDeploymentsApi.listContainerDeploymentHistory(serviceId)).data,
          serviceType: 'CONTAINER' as const,
        }))
        .with('DATABASE', async () => ({
          ...(await databaseDeploymentsApi.listDatabaseDeploymentHistory(serviceId)).data,
          serviceType: 'DATABASE' as const,
        }))
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', async () => ({
          ...(await jobDeploymentsApi.listJobDeploymentHistory(serviceId)).data,
          serviceType: 'JOB' as const,
        }))
        .with('HELM', async () => ({
          ...(await helmDeploymentsApi.listHelmDeploymentHistory(serviceId)).data,
          serviceType: 'HELM' as const,
        }))
        .exhaustive()
    },
  }),
  listLinks: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
  }) => ({
    queryKey: [serviceId],
    async queryFn() {
      return match(serviceType)
        .with('APPLICATION', async () => {
          return (await applicationMainCallsApi.listApplicationLinks(serviceId)).data.results
        })
        .with('CONTAINER', async () => {
          return (await containerMainCallsApi.listContainerLinks(serviceId)).data.results
        })
        .with('HELM', async () => {
          return (await helmMainCallsApi.listHelmLinks(serviceId)).data.results
        })
        .exhaustive()
    },
  }),
  masterCredentials: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'DATABASE'>
  }) => ({
    queryKey: [serviceId],
    async queryFn() {
      return match(serviceType)
        .with('DATABASE', async () => {
          return (await databaseMainCallsApi.getDatabaseMasterCredentials(serviceId)).data
        })
        .exhaustive()
    },
  }),
  defaultAdvancedSettings: ({ serviceType }: { serviceType: Exclude<ServiceType, 'DATABASE'> }) => ({
    queryKey: [serviceType],
    async queryFn() {
      const { query } = match(serviceType)
        .with('APPLICATION', (serviceType) => ({
          query: applicationsApi.getDefaultApplicationAdvancedSettings.bind(applicationsApi),
          serviceType,
        }))
        .with('CONTAINER', (serviceType) => ({
          query: containersApi.getDefaultContainerAdvancedSettings.bind(containersApi),
          serviceType,
        }))
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', (serviceType) => ({
          query: jobsApi.getDefaultJobAdvancedSettings.bind(jobsApi),
          serviceType,
        }))
        .with('HELM', (serviceType) => ({ query: helmsApi.getDefaultHelmAdvancedSettings.bind(helmsApi), serviceType }))
        .exhaustive()
      const response = await query()
      return response.data
    },
  }),
  advancedSettings: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Exclude<ServiceType, 'DATABASE'>
  }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const { query } = match(serviceType)
        .with('APPLICATION', (serviceType) => ({
          query: applicationConfigurationApi.getAdvancedSettings.bind(applicationConfigurationApi),
          serviceType,
        }))
        .with('CONTAINER', (serviceType) => ({
          query: containerConfigurationApi.getContainerAdvancedSettings.bind(containerConfigurationApi),
          serviceType,
        }))
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', (serviceType) => ({
          query: jobConfigurationApi.getJobAdvancedSettings.bind(jobConfigurationApi),
          serviceType,
        }))
        .with('HELM', (serviceType) => ({
          query: helmConfigurationApi.getHelmAdvancedSettings.bind(helmConfigurationApi),
          serviceType,
        }))
        .exhaustive()
      const response = await query(serviceId)
      return response.data
    },
  }),
})

type CloneServiceRequest = {
  serviceId: string
  serviceType: ServiceType
  payload: _CloneServiceRequest
}

type DeploymentRestrictionRequest =
  | {
      serviceId: string
      serviceType: ApplicationType
      deploymentRestrictionId: string
      payload: ApplicationDeploymentRestrictionRequest
    }
  | {
      serviceId: string
      serviceType: JobType
      deploymentRestrictionId: string
      payload: JobDeploymentRestrictionRequest
    }
  | {
      serviceId: string
      serviceType: HelmType
      deploymentRestrictionId: string
      payload: HelmDeploymentRestrictionRequest
    }

type EditServiceRequest = {
  serviceId: string
  payload:
    | ({
        serviceType: ApplicationType
      } & ApplicationEditRequest)
    | ({
        serviceType: ContainerType
      } & ContainerRequest)
    | ({
        serviceType: DatabaseType
      } & DatabaseEditRequest)
    | ({
        serviceType: JobType
      } & JobRequest)
    | ({
        serviceType: HelmType
      } & HelmRequest)
}

type EditAdvancedSettingsRequest = {
  serviceId: string
  payload:
    | ({
        serviceType: ApplicationType
      } & ApplicationAdvancedSettings)
    | ({
        serviceType: ContainerType
      } & ContainerAdvancedSettings)
    | ({
        serviceType: JobType
      } & JobAdvancedSettings)
    | ({
        serviceType: HelmType
      } & HelmAdvancedSettings)
}

export const mutations = {
  async cloneService({ serviceId, serviceType, payload }: CloneServiceRequest) {
    const mutation = match(serviceType)
      .with('APPLICATION', () => applicationsApi.cloneApplication.bind(applicationsApi))
      .with('CONTAINER', () => containersApi.cloneContainer.bind(containersApi))
      .with('DATABASE', () => databasesApi.cloneDatabase.bind(databasesApi))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => jobsApi.cloneJob.bind(jobsApi))
      .with('HELM', () => helmsApi.cloneHelm.bind(helmsApi))
      .exhaustive()
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async editDeploymentRestriction({
    serviceId,
    serviceType,
    deploymentRestrictionId,
    payload,
  }: DeploymentRestrictionRequest) {
    const mutation = match(serviceType)
      .with('APPLICATION', () =>
        applicationDeploymentRestrictionApi.editApplicationDeploymentRestriction.bind(
          applicationDeploymentRestrictionApi
        )
      )
      .with('JOB', () => jobDeploymentRestrictionApi.editJobDeploymentRestriction.bind(jobDeploymentRestrictionApi))
      .with('HELM', () => helmDeploymentRestrictionApi.editHelmDeploymentRestriction.bind(helmDeploymentRestrictionApi))
      .exhaustive()
    const response = await mutation(serviceId, deploymentRestrictionId, payload)
    return response.data
  },
  async createDeploymentRestriction({
    serviceId,
    serviceType,
    payload,
  }: Omit<DeploymentRestrictionRequest, 'deploymentRestrictionId'>) {
    const mutation = match(serviceType)
      .with('APPLICATION', () =>
        applicationDeploymentRestrictionApi.createApplicationDeploymentRestriction.bind(
          applicationDeploymentRestrictionApi
        )
      )
      .with('JOB', () => jobDeploymentRestrictionApi.createJobDeploymentRestriction.bind(jobDeploymentRestrictionApi))
      .with('HELM', () =>
        helmDeploymentRestrictionApi.createHelmDeploymentRestriction.bind(helmDeploymentRestrictionApi)
      )
      .exhaustive()
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async deleteDeploymentRestriction({
    serviceId,
    serviceType,
    deploymentRestrictionId,
  }: Omit<DeploymentRestrictionRequest, 'payload'>) {
    const mutation = match(serviceType)
      .with('APPLICATION', () =>
        applicationDeploymentRestrictionApi.deleteApplicationDeploymentRestriction.bind(
          applicationDeploymentRestrictionApi
        )
      )
      .with('JOB', () => jobDeploymentRestrictionApi.deleteJobDeploymentRestriction.bind(jobDeploymentRestrictionApi))
      .with('HELM', () =>
        helmDeploymentRestrictionApi.deleteHelmDeploymentRestriction.bind(helmDeploymentRestrictionApi)
      )
      .exhaustive()
    const response = await mutation(serviceId, deploymentRestrictionId)
    return response.data
  },
  async deleteService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const mutation = match(serviceType)
      .with('APPLICATION', () => applicationMainCallsApi.deleteApplication.bind(applicationMainCallsApi))
      .with('CONTAINER', () => containerMainCallsApi.deleteContainer.bind(containerMainCallsApi))
      .with('DATABASE', () => databaseMainCallsApi.deleteDatabase.bind(databaseMainCallsApi))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => jobMainCallsApi.deleteJob.bind(jobMainCallsApi))
      .with('HELM', () => helmMainCallsApi.deleteHelm.bind(helmMainCallsApi))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async editService({ serviceId, payload }: EditServiceRequest) {
    const mutation = match(payload)
      .with({ serviceType: 'APPLICATION' }, (payload) =>
        applicationMainCallsApi.editApplication.bind(applicationMainCallsApi, serviceId, payload)
      )
      .with({ serviceType: 'CONTAINER' }, (payload) =>
        containerMainCallsApi.editContainer.bind(containerMainCallsApi, serviceId, payload)
      )
      .with({ serviceType: 'DATABASE' }, (payload) =>
        databaseMainCallsApi.editDatabase.bind(databaseMainCallsApi, serviceId, payload)
      )
      .with({ serviceType: 'JOB' }, (payload) => jobMainCallsApi.editJob.bind(jobMainCallsApi, serviceId, payload))
      .with({ serviceType: 'HELM' }, (payload) => helmMainCallsApi.editHelm.bind(helmMainCallsApi, serviceId, payload))
      .exhaustive()
    const response = await mutation()
    return response.data
  },
  async redeployService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const mutation = match(serviceType)
      .with('APPLICATION', () => applicationActionsApi.redeployApplication.bind(applicationActionsApi))
      .with('CONTAINER', () => containerActionsApi.redeployContainer.bind(containerActionsApi))
      .with('DATABASE', () => databaseActionsApi.redeployDatabase.bind(databaseActionsApi))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => jobActionsApi.redeployJob.bind(jobActionsApi))
      .with('HELM', () => helmActionsApi.redeployHelm.bind(helmActionsApi))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async deployService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const mutation = match(serviceType)
      .with('APPLICATION', () => applicationActionsApi.deployApplication.bind(applicationActionsApi))
      .with('CONTAINER', () => containerActionsApi.deployContainer.bind(containerActionsApi))
      .with('DATABASE', () => databaseActionsApi.deployDatabase.bind(databaseActionsApi))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => jobActionsApi.deployJob.bind(jobActionsApi))
      .with('HELM', () => helmActionsApi.deployHelm.bind(helmActionsApi))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async stopService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const mutation = match(serviceType)
      .with('APPLICATION', () => applicationActionsApi.stopApplication.bind(applicationActionsApi))
      .with('CONTAINER', () => containerActionsApi.stopContainer.bind(containerActionsApi))
      .with('DATABASE', () => databaseActionsApi.stopDatabase.bind(databaseActionsApi))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => jobActionsApi.stopJob.bind(jobActionsApi))
      .with('HELM', () => helmActionsApi.stopHelm.bind(helmActionsApi))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async editAdvancedSettings({ serviceId, payload }: EditAdvancedSettingsRequest) {
    const { mutation } = match(payload)
      .with({ serviceType: 'APPLICATION' }, ({ serviceType, ...payload }) => ({
        mutation: applicationConfigurationApi.editAdvancedSettings.bind(
          applicationConfigurationApi,
          serviceId,
          payload
        ),
        serviceType,
      }))
      .with({ serviceType: 'CONTAINER' }, ({ serviceType, ...payload }) => ({
        mutation: containerConfigurationApi.editContainerAdvancedSettings.bind(
          containerConfigurationApi,
          serviceId,
          payload
        ),
        serviceType,
      }))
      .with({ serviceType: 'JOB' }, ({ serviceType, ...payload }) => ({
        mutation: jobConfigurationApi.editJobAdvancedSettings.bind(jobConfigurationApi, serviceId, payload),
        serviceType,
      }))
      .with({ serviceType: 'HELM' }, ({ serviceType, ...payload }) => ({
        mutation: helmConfigurationApi.editHelmAdvancedSettings.bind(helmConfigurationApi, serviceId, payload),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation()
    return response.data
  },
}

export type ServicesKeys = inferQueryKeys<typeof services>
