import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  type AnyService,
  type Application,
  type ApplicationType,
  type Container,
  type ContainerType,
  type Database,
  type DatabaseType,
  type Helm,
  type HelmType,
  type Job,
  type JobType,
  type ServiceType,
} from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useServiceType } from '../use-service-type/use-service-type'

export type UseServiceProps =
  | {
      environmentId?: string
      serviceId?: string
    }
  | {
      serviceId?: string
      serviceType: ServiceType
    }

export function useService(props: { environmentId?: string; serviceId?: string }): UseQueryResult<AnyService>
export function useService<
  T extends ServiceType,
  R = T extends ApplicationType
    ? Application
    : T extends ContainerType
    ? Container
    : T extends DatabaseType
    ? Database
    : T extends JobType
    ? Job
    : T extends 'CRON_JOB'
    ? Job
    : T extends 'LIFECYCLE_JOB'
    ? Job
    : T extends HelmType
    ? Helm
    : never
>(props: { serviceId: string; serviceType: T }): UseQueryResult<R>
export function useService({ serviceId, ...props }: UseServiceProps) {
  const { data: serviceType } = useServiceType({
    environmentId: 'environmentId' in props ? props.environmentId : undefined,
    serviceId,
  })

  return useQuery({
    ...queries.services.details({
      serviceId: serviceId!,
      serviceType: 'serviceType' in props ? props.serviceType : serviceType!,
    }),
    enabled: Boolean(serviceId) && Boolean(serviceType),
  })
}

export default useService
