import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationActionsApi,
  type ApplicationAdvancedSettings,
  ApplicationConfigurationApi,
  ApplicationCustomDomainApi,
  type DeployRequest as ApplicationDeployRequest,
  ApplicationDeploymentHistoryApi,
  ApplicationDeploymentRestrictionApi,
  type ApplicationDeploymentRestrictionRequest,
  type ApplicationEditRequest,
  ApplicationMainCallsApi,
  type ApplicationRequest,
  ApplicationsApi,
  type CleanFailedJobsRequest,
  ContainerActionsApi,
  type ContainerAdvancedSettings,
  ContainerConfigurationApi,
  ContainerCustomDomainApi,
  type ContainerDeployRequest,
  ContainerDeploymentHistoryApi,
  ContainerMainCallsApi,
  type ContainerRequest,
  ContainersApi,
  type CustomDomainRequest,
  DatabaseActionsApi,
  DatabaseDeploymentHistoryApi,
  type DatabaseEditRequest,
  DatabaseMainCallsApi,
  type DatabaseRequest,
  DatabasesApi,
  type DeployAllRequest,
  type Environment,
  EnvironmentActionsApi,
  EnvironmentMainCallsApi,
  type EnvironmentServiceIdsAllRequest,
  HelmActionsApi,
  type HelmAdvancedSettings,
  HelmConfigurationApi,
  HelmCustomDomainApi,
  type HelmDeployRequest,
  HelmDeploymentHistoryApi,
  HelmDeploymentRestrictionApi,
  type HelmDeploymentRestrictionRequest,
  HelmMainCallsApi,
  type HelmRequest,
  HelmsApi,
  JobActionsApi,
  type JobAdvancedSettings,
  JobConfigurationApi,
  type JobDeployRequest,
  JobDeploymentHistoryApi,
  JobDeploymentRestrictionApi,
  type JobDeploymentRestrictionRequest,
  type JobForceEvent,
  JobMainCallsApi,
  type JobRequest,
  JobsApi,
  type RebootServicesRequest,
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

const environmentApi = new EnvironmentMainCallsApi()
const environmentActionApi = new EnvironmentActionsApi()

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

const customDomainApplicationApi = new ApplicationCustomDomainApi()
const customDomainContainerApi = new ContainerCustomDomainApi()
const customDomainHelmApi = new HelmCustomDomainApi()

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

// XXX: Need to remove `serviceType` and use only `service_type` since the the API now supports it.
// Waiting to have this implementation available in the edition interfaces.
export type Application = _Application & {
  // @deprecated Prefer use `service_type` from API instead of `serviceType`
  serviceType: ApplicationType
}
export type Database = _Database & {
  // @deprecated Prefer use `service_type` from API instead of `serviceType`
  serviceType: DatabaseType
}
export type Container = _Container & {
  // @deprecated Prefer use `service_type` from API instead of `serviceType`
  serviceType: ContainerType
}
export type Job = _Job & {
  // @deprecated Prefer use `service_type` from API instead of `serviceType`
  serviceType: JobType
}
export type Helm = _Helm & {
  // @deprecated Prefer use `service_type` from API instead of `serviceType`
  serviceType: HelmType
}

export type AnyService = Application | Database | Container | Job | Helm

export type AdvancedSettings =
  | ApplicationAdvancedSettings
  | ContainerAdvancedSettings
  | JobAdvancedSettings
  | HelmAdvancedSettings

export function isApplication(service: AnyService): service is Application {
  return service.service_type === 'APPLICATION'
}

export function isContainer(service: AnyService): service is Container {
  return service.service_type === 'CONTAINER'
}

export function isDatabase(service: AnyService): service is Database {
  return service.service_type === 'DATABASE'
}

export function isJob(service: AnyService): service is Job {
  return service.service_type === 'JOB'
}

export function isHelm(service: AnyService): service is Helm {
  return service.service_type === 'HELM'
}

export const services = createQueryKeys('services', {
  deploymentStatus: (environmentId: string, serviceId: string) => ({
    queryKey: [environmentId, serviceId],
    // NOTE: Value is set by WebSocket
    queryFn() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return new Promise<Status | null>(() => {})
    },
  }),
  runningStatus: (environmentId: string, serviceId: string) => ({
    queryKey: [environmentId, serviceId],
    // NOTE: Value is set by WebSocket
    queryFn() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return new Promise<ApplicationStatusDto | DatabaseStatusDto | null>(() => {})
    },
  }),
  metrics: (environmentId: string, serviceId: string) => ({
    queryKey: [environmentId, serviceId],
    // NOTE: Value is set by WebSocket
    queryFn() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
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
      const response = await environmentApi.listServicesByEnvironmentId(environmentId)
      return (response.data.results || []).map((service) =>
        match(service)
          .with({ service_type: 'APPLICATION' }, (s) => ({
            ...s,
            serviceType: 'APPLICATION' as const,
          }))
          .with({ service_type: 'CONTAINER' }, (s) => ({
            ...s,
            serviceType: 'CONTAINER' as const,
          }))
          .with({ service_type: 'DATABASE' }, (s) => ({
            ...s,
            serviceType: 'DATABASE' as const,
          }))
          .with({ service_type: 'JOB' }, (s) => ({
            ...s,
            serviceType: 'JOB' as const,
          }))
          .with({ service_type: 'HELM' }, (s) => ({
            ...s,
            serviceType: 'HELM' as const,
          }))
          .exhaustive()
      ) as AnyService[]
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
  listCommits: (
    props:
      | {
          serviceId: string
          serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'>
        }
      | {
          serviceId: string
          serviceType: Extract<ServiceType, 'HELM'>
          of?: 'values' | 'chart'
        }
  ) => ({
    queryKey: [props.serviceId, props.serviceType === 'HELM' ? props.of ?? 'chart' : undefined],
    async queryFn() {
      const { results: commits } = await match(props)
        .with({ serviceType: 'APPLICATION' }, async ({ serviceId, serviceType }) => ({
          results: (await applicationMainCallsApi.listApplicationCommit(serviceId)).data.results,
          serviceType,
        }))
        .with(
          { serviceType: 'JOB' },
          { serviceType: 'CRON_JOB' },
          { serviceType: 'LIFECYCLE_JOB' },
          async ({ serviceId, serviceType }) => ({
            results: (await jobMainCallsApi.listJobCommit(serviceId)).data.results,
            serviceType,
          })
        )
        .with({ serviceType: 'HELM' }, async ({ serviceId, serviceType, of }) => {
          return {
            results: (await helmMainCallsApi.listHelmCommit(serviceId, of)).data.results,
            serviceType,
          }
        })
        .exhaustive()
      return commits
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
      const { query } = match(serviceType)
        .with('APPLICATION', (serviceType) => ({
          query: applicationMainCallsApi.listApplicationLinks.bind(applicationMainCallsApi),
          serviceType,
        }))
        .with('CONTAINER', (serviceType) => ({
          query: containerMainCallsApi.listContainerLinks.bind(containerMainCallsApi),
          serviceType,
        }))
        .with('HELM', (serviceType) => ({ query: helmMainCallsApi.listHelmLinks.bind(helmMainCallsApi), serviceType }))
        .exhaustive()
      const response = await query(serviceId)
      return response.data.results
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
  customDomains: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
  }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const { query } = match(serviceType)
        .with('APPLICATION', (serviceType) => ({
          query: customDomainApplicationApi.listApplicationCustomDomain.bind(customDomainApplicationApi),
          serviceType,
        }))
        .with('CONTAINER', (serviceType) => ({
          query: customDomainContainerApi.listContainerCustomDomain.bind(customDomainContainerApi),
          serviceType,
        }))
        .with('HELM', (serviceType) => ({
          query: customDomainHelmApi.listHelmCustomDomain.bind(customDomainHelmApi),
          serviceType,
        }))
        .exhaustive()
      const response = await query(serviceId)
      return response.data.results
    },
  }),
  checkCustomDomains: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
  }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const { query } = match(serviceType)
        .with('APPLICATION', (serviceType) => ({
          query: customDomainApplicationApi.checkApplicationCustomDomain.bind(customDomainApplicationApi),
          serviceType,
        }))
        .with('CONTAINER', (serviceType) => ({
          query: customDomainContainerApi.checkContainerCustomDomain.bind(customDomainContainerApi),
          serviceType,
        }))
        .with('HELM', (serviceType) => ({
          query: customDomainHelmApi.checkHelmCustomDomain.bind(customDomainHelmApi),
          serviceType,
        }))
        .exhaustive()
      const response = await query(serviceId)
      return response.data.results
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

type CreateServiceRequest = {
  environmentId: string
  payload:
    | ({
        serviceType: ApplicationType
      } & ApplicationRequest)
    | ({
        serviceType: ContainerType
      } & ContainerRequest)
    | ({
        serviceType: DatabaseType
      } & DatabaseRequest)
    | ({
        serviceType: JobType
      } & JobRequest)
    | ({
        serviceType: HelmType
      } & HelmRequest)
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

type DeployRequest =
  | {
      serviceId: string
      serviceType: ApplicationType
      request?: ApplicationDeployRequest
    }
  | {
      serviceId: string
      serviceType: ContainerType
      request?: ContainerDeployRequest
    }
  | {
      serviceId: string
      serviceType: JobType
      forceEvent?: JobForceEvent
      request?: JobDeployRequest
    }
  | {
      serviceId: string
      serviceType: HelmType
      request?: HelmDeployRequest
    }
  | {
      serviceId: string
      serviceType: DatabaseType
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
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationsApi.cloneApplication.bind(applicationsApi),
        serviceType,
      }))
      .with('CONTAINER', (serviceType) => ({ mutation: containersApi.cloneContainer.bind(containersApi), serviceType }))
      .with('DATABASE', (serviceType) => ({ mutation: databasesApi.cloneDatabase.bind(databasesApi), serviceType }))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', (serviceType) => ({
        mutation: jobsApi.cloneJob.bind(jobsApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({ mutation: helmsApi.cloneHelm.bind(helmsApi), serviceType }))
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
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationDeploymentRestrictionApi.editApplicationDeploymentRestriction.bind(
          applicationDeploymentRestrictionApi
        ),
        serviceType,
      }))
      .with('JOB', (serviceType) => ({
        mutation: jobDeploymentRestrictionApi.editJobDeploymentRestriction.bind(jobDeploymentRestrictionApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({
        mutation: helmDeploymentRestrictionApi.editHelmDeploymentRestriction.bind(helmDeploymentRestrictionApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, deploymentRestrictionId, payload)
    return response.data
  },
  async createDeploymentRestriction({
    serviceId,
    serviceType,
    payload,
  }: Omit<DeploymentRestrictionRequest, 'deploymentRestrictionId'>) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationDeploymentRestrictionApi.createApplicationDeploymentRestriction.bind(
          applicationDeploymentRestrictionApi
        ),
        serviceType,
      }))
      .with('JOB', (serviceType) => ({
        mutation: jobDeploymentRestrictionApi.createJobDeploymentRestriction.bind(jobDeploymentRestrictionApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({
        mutation: helmDeploymentRestrictionApi.createHelmDeploymentRestriction.bind(helmDeploymentRestrictionApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async deleteDeploymentRestriction({
    serviceId,
    serviceType,
    deploymentRestrictionId,
  }: Omit<DeploymentRestrictionRequest, 'payload'>) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationDeploymentRestrictionApi.deleteApplicationDeploymentRestriction.bind(
          applicationDeploymentRestrictionApi
        ),
        serviceType,
      }))
      .with('JOB', (serviceType) => ({
        mutation: jobDeploymentRestrictionApi.deleteJobDeploymentRestriction.bind(jobDeploymentRestrictionApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({
        mutation: helmDeploymentRestrictionApi.deleteHelmDeploymentRestriction.bind(helmDeploymentRestrictionApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, deploymentRestrictionId)
    return response.data
  },
  async deleteAllServices({
    environment,
    payload,
  }: {
    environment: Environment
    payload: EnvironmentServiceIdsAllRequest
  }) {
    const response = await environmentActionApi.deleteSelectedServices(environment.id, payload)
    return response.data
  },
  async deleteService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationMainCallsApi.deleteApplication.bind(applicationMainCallsApi),
        serviceType,
      }))
      .with('CONTAINER', (serviceType) => ({
        mutation: containerMainCallsApi.deleteContainer.bind(containerMainCallsApi),
        serviceType,
      }))
      .with('DATABASE', (serviceType) => ({
        mutation: databaseMainCallsApi.deleteDatabase.bind(databaseMainCallsApi),
        serviceType,
      }))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', (serviceType) => ({
        mutation: jobMainCallsApi.deleteJob.bind(jobMainCallsApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({ mutation: helmMainCallsApi.deleteHelm.bind(helmMainCallsApi), serviceType }))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async createService({ environmentId, payload }: CreateServiceRequest) {
    const { mutation } = match(payload)
      .with({ serviceType: 'APPLICATION' }, (payload) => ({
        mutation: applicationsApi.createApplication.bind(applicationsApi, environmentId, payload),
        serviceType: 'APPLICATION' as const,
      }))
      .with({ serviceType: 'CONTAINER' }, (payload) => ({
        mutation: containersApi.createContainer.bind(containersApi, environmentId, payload),
        serviceType: 'CONTAINER' as const,
      }))
      .with({ serviceType: 'DATABASE' }, (payload) => ({
        mutation: databasesApi.createDatabase.bind(databasesApi, environmentId, payload),
        serviceType: 'DATABASE' as const,
      }))
      .with({ serviceType: 'JOB' }, (payload) => ({
        mutation: jobsApi.createJob.bind(jobsApi, environmentId, payload),
        serviceType: 'JOB' as const,
      }))
      .with({ serviceType: 'HELM' }, (payload) => ({
        mutation: helmsApi.createHelm.bind(helmsApi, environmentId, payload),
        serviceType: 'HELM' as const,
      }))
      .exhaustive()
    const response = await mutation()
    return response.data
  },
  async editService({ serviceId, payload }: EditServiceRequest) {
    const { mutation } = match(payload)
      .with({ serviceType: 'APPLICATION' }, ({ serviceType, ...payload }) => ({
        mutation: applicationMainCallsApi.editApplication.bind(applicationMainCallsApi, serviceId, payload),
        serviceType,
      }))
      .with({ serviceType: 'CONTAINER' }, ({ serviceType, ...payload }) => ({
        mutation: containerMainCallsApi.editContainer.bind(containerMainCallsApi, serviceId, payload),
        serviceType,
      }))
      .with({ serviceType: 'DATABASE' }, ({ serviceType, ...payload }) => ({
        mutation: databaseMainCallsApi.editDatabase.bind(databaseMainCallsApi, serviceId, payload),
        serviceType,
      }))
      .with({ serviceType: 'JOB' }, ({ serviceType, ...payload }) => ({
        mutation: jobMainCallsApi.editJob.bind(jobMainCallsApi, serviceId, payload),
        serviceType,
      }))
      .with({ serviceType: 'HELM' }, ({ serviceType, ...payload }) => ({
        mutation: helmMainCallsApi.editHelm.bind(helmMainCallsApi, serviceId, payload),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation()
    return response.data
  },
  async restartAllServices({ environment, payload }: { environment: Environment; payload: RebootServicesRequest }) {
    const response = await environmentActionApi.rebootServices(environment.id, payload)
    return response.data
  },
  async restartService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationActionsApi.rebootApplication.bind(applicationActionsApi),
        serviceType,
      }))
      .with('CONTAINER', (serviceType) => ({
        mutation: containerActionsApi.rebootContainer.bind(containerActionsApi),
        serviceType,
      }))
      .with('DATABASE', (serviceType) => ({
        mutation: databaseActionsApi.rebootDatabase.bind(databaseActionsApi),
        serviceType,
      }))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', (serviceType) => ({
        mutation: jobActionsApi.redeployJob.bind(jobActionsApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({
        mutation: helmActionsApi.redeployHelm.bind(helmActionsApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async deployAllServices({ environment, payload }: { environment: Environment; payload: DeployAllRequest }) {
    const result = await environmentActionApi.deployAllServices(environment.id, payload)
    return result.data
  },
  async deployService(props: DeployRequest) {
    const { mutation } = match(props)
      .with({ serviceType: 'APPLICATION' }, ({ serviceId, serviceType, request }) => ({
        mutation: applicationActionsApi.deployApplication.bind(applicationActionsApi, serviceId, request),
        serviceType,
      }))
      .with({ serviceType: 'CONTAINER' }, ({ serviceId, serviceType, request }) => ({
        mutation: containerActionsApi.deployContainer.bind(containerActionsApi, serviceId, request),
        serviceType,
      }))
      .with({ serviceType: 'DATABASE' }, ({ serviceId, serviceType }) => ({
        mutation: databaseActionsApi.deployDatabase.bind(databaseActionsApi, serviceId),
        serviceType,
      }))
      .with({ serviceType: 'JOB' }, ({ serviceId, serviceType, forceEvent, request }) => ({
        mutation: jobActionsApi.deployJob.bind(jobActionsApi, serviceId, forceEvent, request),
        serviceType,
      }))
      .with({ serviceType: 'HELM' }, ({ serviceId, serviceType, request }) => ({
        mutation: helmActionsApi.deployHelm.bind(helmActionsApi, serviceId, undefined, request),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation()
    return response.data
  },
  async stopAllServices({
    environment,
    payload,
  }: {
    environment: Environment
    payload: EnvironmentServiceIdsAllRequest
  }) {
    const response = await environmentActionApi.stopSelectedServices(environment.id, payload)
    return response.data
  },
  async stopService({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: applicationActionsApi.stopApplication.bind(applicationActionsApi),
        serviceType,
      }))
      .with('CONTAINER', (serviceType) => ({
        mutation: containerActionsApi.stopContainer.bind(containerActionsApi),
        serviceType,
      }))
      .with('DATABASE', (serviceType) => ({
        mutation: databaseActionsApi.stopDatabase.bind(databaseActionsApi),
        serviceType,
      }))
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', (serviceType) => ({
        mutation: jobActionsApi.stopJob.bind(jobActionsApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({ mutation: helmActionsApi.stopHelm.bind(helmActionsApi), serviceType }))
      .exhaustive()
    const response = await mutation(serviceId)
    return response.data
  },
  async cancelDeploymentService({ environmentId, force = false }: { environmentId: string; force?: boolean }) {
    const result = await environmentActionApi.cancelEnvironmentDeployment(environmentId, { force_cancel: force })
    return result.data
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
  async createCustomDomain({
    serviceId,
    serviceType,
    payload,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
    payload: CustomDomainRequest
  }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', () => ({
        mutation: customDomainApplicationApi.createApplicationCustomDomain.bind(customDomainApplicationApi),
        serviceType,
      }))
      .with('CONTAINER', () => ({
        mutation: customDomainContainerApi.createContainerCustomDomain.bind(customDomainContainerApi),
        serviceType,
      }))
      .with('HELM', () => ({
        mutation: customDomainHelmApi.createHelmCustomDomain.bind(customDomainHelmApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async editCustomDomain({
    serviceId,
    serviceType,
    customDomainId,
    payload,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
    customDomainId: string
    payload: CustomDomainRequest
  }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', () => ({
        mutation: customDomainApplicationApi.editCustomDomain.bind(customDomainApplicationApi),
        serviceType,
      }))
      .with('CONTAINER', () => ({
        mutation: customDomainContainerApi.editContainerCustomDomain.bind(customDomainContainerApi),
        serviceType,
      }))
      .with('HELM', () => ({
        mutation: customDomainHelmApi.editHelmCustomDomain.bind(customDomainHelmApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, customDomainId, payload)
    return response.data
  },
  async deleteCustomDomain({
    serviceId,
    serviceType,
    customDomainId,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
    customDomainId: string
  }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: customDomainApplicationApi.deleteCustomDomain.bind(customDomainApplicationApi),
        serviceType,
      }))
      .with('CONTAINER', (serviceType) => ({
        mutation: customDomainContainerApi.deleteContainerCustomDomain.bind(customDomainContainerApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({
        mutation: customDomainHelmApi.deleteHelmCustomDomain.bind(customDomainHelmApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, customDomainId)
    return response.data
  },
  async cleanFailedJobs({ environmentId, payload }: { environmentId: string; payload: CleanFailedJobsRequest }) {
    const response = await environmentActionApi.cleanFailedJobs(environmentId, payload)
    return response.data
  },
}

export type ServicesKeys = inferQueryKeys<typeof services>
