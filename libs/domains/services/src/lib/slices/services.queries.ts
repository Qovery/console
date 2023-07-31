import {
  ApplicationsApi,
  CloneApplicationRequest,
  CloneContainerRequest,
  CloneDatabaseRequest,
  CloneJobRequest,
  ContainersApi,
  DatabasesApi,
  JobsApi,
} from 'qovery-typescript-axios'
import { useMutation } from 'react-query'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

const applicationsApi = new ApplicationsApi()

const containersApi = new ContainersApi()

const databasesApi = new DatabasesApi()

const jobsApi = new JobsApi()

type UseCloneServiceProps =
  | {
      serviceId: string
      serviceType: ServiceTypeEnum.APPLICATION
      cloneRequest: CloneApplicationRequest
    }
  | {
      serviceId: string
      serviceType: ServiceTypeEnum.CONTAINER
      cloneRequest: CloneContainerRequest
    }
  | {
      serviceId: string
      serviceType: ServiceTypeEnum.DATABASE
      cloneRequest: CloneDatabaseRequest
    }
  | {
      serviceId: string
      serviceType: ServiceTypeEnum.JOB | ServiceTypeEnum.LIFECYCLE_JOB | ServiceTypeEnum.CRON_JOB
      cloneRequest: CloneJobRequest
    }

export const useCloneService = () => {
  return useMutation(
    async ({ serviceId, serviceType, cloneRequest }: UseCloneServiceProps) => {
      const mapper = {
        [ServiceTypeEnum.APPLICATION]: applicationsApi.cloneApplication.bind(applicationsApi),
        [ServiceTypeEnum.CONTAINER]: containersApi.cloneContainer.bind(containersApi),
        [ServiceTypeEnum.DATABASE]: databasesApi.cloneDatabase.bind(databasesApi),
        [ServiceTypeEnum.JOB]: jobsApi.cloneJob.bind(jobsApi),
        [ServiceTypeEnum.CRON_JOB]: jobsApi.cloneJob.bind(jobsApi),
        [ServiceTypeEnum.LIFECYCLE_JOB]: jobsApi.cloneJob.bind(jobsApi),
      } as const
      const mutation = mapper[serviceType]
      const response = await mutation(serviceId, cloneRequest)
      return response.data
    },
    {
      onSuccess() {
        toast(ToastEnum.SUCCESS, 'Your service is cloned')
      },
      onError: (err) => {
        toastError(err as Error)
      },
    }
  )
}
