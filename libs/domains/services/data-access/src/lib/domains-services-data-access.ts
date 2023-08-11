import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
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
  type InlineResponse200,
  JobMainCallsApi,
  JobsApi,
} from 'qovery-typescript-axios'
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

// Use this type in param instead of ServiceTypeEnum
// to suppport string AND enum as param
type ServiceType = keyof typeof ServiceTypeEnum

export type ServiceStatuses = InlineResponse200

export const services = createQueryKeys('services', {
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
  getStatus: ({ id: serviceId, serviceType }: { id: string; serviceType: ServiceType }) => ({
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
})

type CloneServiceProps =
  | {
      serviceId: string
      serviceType: Extract<ServiceType, 'APPLICATION'>
      cloneRequest: CloneApplicationRequest
    }
  | {
      serviceId: string
      serviceType: Extract<ServiceType, 'CONTAINER'>
      cloneRequest: CloneContainerRequest
    }
  | {
      serviceId: string
      serviceType: Extract<ServiceType, 'DATABASE'>
      cloneRequest: CloneDatabaseRequest
    }
  | {
      serviceId: string
      serviceType: Extract<ServiceType, 'JOB' | 'LIFECYCLE_JOB' | 'CRON_JOB'>
      cloneRequest: CloneJobRequest
    }

export const mutations = {
  async cloneService({ serviceId, serviceType, cloneRequest }: CloneServiceProps) {
    const mapper = {
      APPLICATION: applicationsApi.cloneApplication.bind(applicationsApi),
      CONTAINER: containersApi.cloneContainer.bind(containersApi),
      DATABASE: databasesApi.cloneDatabase.bind(databasesApi),
      JOB: jobsApi.cloneJob.bind(jobsApi),
      CRON_JOB: jobsApi.cloneJob.bind(jobsApi),
      LIFECYCLE_JOB: jobsApi.cloneJob.bind(jobsApi),
    } as const
    const mutation = mapper[serviceType]
    const response = await mutation(serviceId, cloneRequest)
    return response.data
  },
}

export type ServicesKeys = inferQueryKeys<typeof services>
