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
  JobDeploymentRestrictionApi,
  type JobDeploymentRestrictionRequest,
  JobMainCallsApi,
  JobsApi,
  type Status,
} from 'qovery-typescript-axios'
import { type ApplicationStatusDto, type DatabaseStatusDto, type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'
import { ServiceTypeEnum } from '@qovery/shared/enums'

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
const jobDeploymentApi = new JobDeploymentRestrictionApi()

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
          serviceType: ServiceTypeEnum.APPLICATION as const,
        })),
        ...((await containersApi.listContainer(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: ServiceTypeEnum.CONTAINER as const,
        })),
        ...((await databasesApi.listDatabase(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: ServiceTypeEnum.DATABASE as const,
        })),
        ...((await jobsApi.listJobs(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          serviceType: ServiceTypeEnum.JOB as const,
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
        APPLICATION: applicationDeploymentApi.getApplicationDeploymentRestrictions.bind(applicationDeploymentApi),
        CONTAINER: null,
        DATABASE: null,
        JOB: jobDeploymentApi.getJobDeploymentRestrictions.bind(jobDeploymentApi),
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
      const service = await match(serviceType)
        .with('APPLICATION', async () => ({
          ...(await applicationMainCallsApi.getApplication(serviceId)).data,
          serviceType: ServiceTypeEnum.APPLICATION as const,
        }))
        .with('CONTAINER', async () => ({
          ...(await containerMainCallsApi.getContainer(serviceId)).data,
          serviceType: ServiceTypeEnum.CONTAINER as const,
        }))
        .with('DATABASE', async () => ({
          ...(await databaseMainCallsApi.getDatabase(serviceId)).data,
          serviceType: ServiceTypeEnum.DATABASE as const,
        }))
        .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', async () => ({
          ...(await jobMainCallsApi.getJob(serviceId)).data,
          serviceType: ServiceTypeEnum.JOB as const,
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
    serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'>
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
      JOB: jobDeploymentApi.editJobDeploymentRestriction.bind(jobDeploymentApi),
      CRON_JOB: jobDeploymentApi.editJobDeploymentRestriction.bind(jobDeploymentApi),
      LIFECYCLE_JOB: jobDeploymentApi.editJobDeploymentRestriction.bind(jobDeploymentApi),
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
      JOB: jobDeploymentApi.createJobDeploymentRestriction.bind(jobDeploymentApi),
      CRON_JOB: jobDeploymentApi.createJobDeploymentRestriction.bind(jobDeploymentApi),
      LIFECYCLE_JOB: jobDeploymentApi.createJobDeploymentRestriction.bind(jobDeploymentApi),
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
      JOB: jobDeploymentApi.deleteJobDeploymentRestriction.bind(jobDeploymentApi),
      CRON_JOB: jobDeploymentApi.deleteJobDeploymentRestriction.bind(jobDeploymentApi),
      LIFECYCLE_JOB: jobDeploymentApi.deleteJobDeploymentRestriction.bind(jobDeploymentApi),
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
