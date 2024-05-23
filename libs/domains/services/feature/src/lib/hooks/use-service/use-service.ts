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

/**
 * Here we use TS function overload to allow us to call the hook in 2 different ways.
 * The first one to get a service which you don't know the type of ahead.
 * ```ts
 * const { data: service } = useService({ environmentId: '123', serviceId: '456' })
 * ```
 * The seconde one to get a service which you already know the type of.
 * ```ts
 * const { data: database } = useService({ serviceId: '456', serviceType: 'DATABASE' })
 * ```
 *
 * https://dev.to/zirkelc/how-to-return-different-types-from-functions-in-typescript-2a2h
 * https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
 **/
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
                : never,
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
