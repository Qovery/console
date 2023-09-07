import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationDeploymentRestrictionApi,
  type ApplicationDeploymentRestrictionRequest,
  ApplicationMainCallsApi,
  ApplicationsApi,
  type CloneApplicationRequest,
  type CloneContainerRequest,
  type CloneDatabaseRequest,
  type CloneJobRequest,
  ContainerMainCallsApi,
  ContainersApi,
  DatabaseMainCallsApi,
  DatabasesApi,
  EnvironmentMainCallsApi,
  JobMainCallsApi,
  JobsApi,
  type Status,
} from 'qovery-typescript-axios'
import { type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type ServiceRunningStatus } from '@qovery/shared/interfaces'

const applicationsApi = new ApplicationsApi()
const containersApi = new ContainersApi()
const databasesApi = new DatabasesApi()
const jobsApi = new JobsApi()

const applicationMainCallsApi = new ApplicationMainCallsApi()
const containerMainCallsApi = new ContainerMainCallsApi()
const databaseMainCallsApi = new DatabaseMainCallsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const jobMainCallsApi = new JobMainCallsApi()

const applicationDeploymentApi = new ApplicationDeploymentRestrictionApi()

// Use this type in param instead of ServiceTypeEnum
// to suppport string AND enum as param
export type ServiceType = keyof typeof ServiceTypeEnum

export type ApplicationType = Extract<keyof typeof ServiceTypeEnum, 'APPLICATION'>
export type ContainerType = Extract<ServiceType, 'CONTAINER'>
export type DatabaseType = Extract<ServiceType, 'DATABASE'>
export type JobType = Extract<ServiceType, 'JOB' | 'LIFECYCLE_JOB' | 'CRON_JOB'>

export function isApplicationType(serviceType: ServiceType): serviceType is ApplicationType {
  return serviceType === 'APPLICATION'
}

export function isContainerType(serviceType: ServiceType): serviceType is ContainerType {
  return serviceType === 'CONTAINER'
}

export function isDatabaseType(serviceType: ServiceType): serviceType is DatabaseType {
  return serviceType === 'DATABASE'
}

export function isJobType(serviceType: ServiceType): serviceType is JobType {
  return serviceType === 'JOB' || serviceType === 'CRON_JOB' || serviceType === 'LIFECYCLE_JOB'
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
      return new Promise<ServiceRunningStatus | null>(() => {})
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
          serviceType: ServiceTypeEnum.APPLICATION,
        })),
        ...((await containersApi.listContainer(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: ServiceTypeEnum.CONTAINER,
        })),
        ...((await databasesApi.getEnvironmentDatabaseStatus(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: ServiceTypeEnum.DATABASE,
        })),
        ...((await jobsApi.getEnvironmentJobStatus(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: ServiceTypeEnum.JOB,
        })),
      ]
    },
  }),
  status: ({ id: serviceId, serviceType }: { id: string; serviceType: ServiceType }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const mapper = {
        APPLICATION: applicationMainCallsApi.getApplicationStatus.bind(applicationMainCallsApi),
        CONTAINER: containerMainCallsApi.getContainerStatus.bind(containerMainCallsApi),
        DATABASE: databaseMainCallsApi.getDatabaseStatus.bind(databaseMainCallsApi),
        JOB: jobMainCallsApi.getJobStatus.bind(jobMainCallsApi),
        CRON_JOB: jobMainCallsApi.getJobStatus.bind(jobMainCallsApi),
        LIFECYCLE_JOB: jobMainCallsApi.getJobStatus.bind(jobMainCallsApi),
      } as const
      const fn = mapper[serviceType]
      const response = await fn(serviceId)
      return response.data
    },
  }),
  deploymentRestrictions: ({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) => ({
    queryKey: [serviceId],
    async queryFn() {
      const mapper = {
        APPLICATION: applicationDeploymentApi.getApplicationDeploymentRestrictions.bind(applicationMainCallsApi),
        CONTAINER: null,
        DATABASE: null,
        JOB: null, // Waiting on https://qovery.atlassian.net/browse/COR-573
        CRON_JOB: null,
        LIFECYCLE_JOB: null,
      } as const
      const fn = mapper[serviceType]
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
      const mapper = {
        APPLICATION: applicationMainCallsApi.getApplication.bind(applicationMainCallsApi),
        CONTAINER: containerMainCallsApi.getContainer.bind(containerMainCallsApi),
        DATABASE: databaseMainCallsApi.getDatabase.bind(databaseMainCallsApi),
        JOB: jobMainCallsApi.getJob.bind(jobMainCallsApi),
        CRON_JOB: jobMainCallsApi.getJob.bind(jobMainCallsApi),
        LIFECYCLE_JOB: jobMainCallsApi.getJob.bind(jobMainCallsApi),
      } as const
      const fn = mapper[serviceType]
      const response = await fn(serviceId)
      return response.data
    },
  }),
})

type CloneServiceRequest =
  | {
      serviceId: string
      serviceType: ApplicationType
      payload: CloneApplicationRequest
    }
  | {
      serviceId: string
      serviceType: ContainerType
      payload: CloneContainerRequest
    }
  | {
      serviceId: string
      serviceType: DatabaseType
      payload: CloneDatabaseRequest
    }
  | {
      serviceId: string
      serviceType: JobType
      payload: CloneJobRequest
    }

type DeploymentRestrictionRequest = {
  serviceId: string
  serviceType: ApplicationType
  deploymentRestrictionId: string
  payload: ApplicationDeploymentRestrictionRequest
}

export const mutations = {
  async cloneService({ serviceId, serviceType, payload }: CloneServiceRequest) {
    const mapper = {
      APPLICATION: applicationsApi.cloneApplication.bind(applicationsApi),
      CONTAINER: containersApi.cloneContainer.bind(containersApi),
      DATABASE: databasesApi.cloneDatabase.bind(databasesApi),
      JOB: jobsApi.cloneJob.bind(jobsApi),
      CRON_JOB: jobsApi.cloneJob.bind(jobsApi),
      LIFECYCLE_JOB: jobsApi.cloneJob.bind(jobsApi),
    } as const
    const mutation = mapper[serviceType]
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async editDeploymentRestriction({
    serviceId,
    serviceType,
    deploymentRestrictionId,
    payload,
  }: DeploymentRestrictionRequest) {
    const mapper = {
      APPLICATION: applicationDeploymentApi.editApplicationDeploymentRestriction.bind(applicationDeploymentApi),
    } as const
    const mutation = mapper[serviceType]
    if (!mutation) {
      throw new Error(`editDeploymentRestriction unsupported for serviceType: ${serviceType}`)
    }
    const response = await mutation(serviceId, deploymentRestrictionId, payload)
    return response.data
  },
  async createDeploymentRestriction({
    serviceId,
    serviceType,
    payload,
  }: Omit<DeploymentRestrictionRequest, 'deploymentRestrictionId'>) {
    const mapper = {
      APPLICATION: applicationDeploymentApi.createApplicationDeploymentRestriction.bind(applicationDeploymentApi),
    } as const
    const mutation = mapper[serviceType]
    if (!mutation) {
      throw new Error(`createDeploymentRestriction unsupported for serviceType: ${serviceType}`)
    }
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async deleteDeploymentRestriction({
    serviceId,
    serviceType,
    deploymentRestrictionId,
  }: Omit<DeploymentRestrictionRequest, 'payload'>) {
    const mapper = {
      APPLICATION: applicationDeploymentApi.deleteApplicationDeploymentRestriction.bind(applicationDeploymentApi),
    } as const
    const mutation = mapper[serviceType]
    if (!mutation) {
      throw new Error(`deleteDeploymentRestriction unsupported for serviceType: ${serviceType}`)
    }
    const response = await mutation(serviceId, deploymentRestrictionId)
    return response.data
  },
}

export type ServicesKeys = inferQueryKeys<typeof services>
