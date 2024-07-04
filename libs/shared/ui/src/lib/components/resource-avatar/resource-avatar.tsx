import { type VariantProps, cva } from 'class-variance-authority'
import {
  type Cluster,
  type Environment,
  type Project,
  type Application as _Application,
  type ContainerResponse as _Container,
  type Database as _Database,
  type HelmResponse as _Helm,
  type JobResponse as _Job,
} from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { P, match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

type ServiceType = keyof typeof ServiceTypeEnum

type ApplicationType = Extract<ServiceType, 'APPLICATION'>
type ContainerType = Extract<ServiceType, 'CONTAINER'>
type DatabaseType = Extract<ServiceType, 'DATABASE'>
type JobType = Extract<ServiceType, 'JOB'>
type HelmType = Extract<ServiceType, 'HELM'>

type Application = _Application & { serviceType: ApplicationType }
type Database = _Database & { serviceType: DatabaseType }
type Container = _Container & { serviceType: ContainerType }
type Job = _Job & { serviceType: JobType }
type Helm = _Helm & { serviceType: HelmType }

type AnyService = Application | Database | Container | Job | Helm

const resourceAvatarVariants = cva(['flex', 'items-center', 'justify-center'], {
  variants: {
    size: {
      md: ['h-16', 'w-16'],
      xs: ['h-8', 'w-8'],
    },
    border: {
      true: ['rounded-full', 'border', 'border-neutral-200'],
      false: [],
    },
  },
  defaultVariants: {
    size: 'md',
    border: false,
  },
})

const resourceAvatarIconVariants = cva('', {
  variants: {
    size: {
      md: [],
      xs: [],
    },
    border: {
      true: [],
      false: [],
    },
  },
  compoundVariants: [
    { border: true, size: 'md', className: ['h-10', 'w-10'] },
    { border: true, size: 'xs', className: ['h-6', 'w-6'] },
    { border: false, size: 'md', className: ['h-16', 'w-16'] },
    { border: false, size: 'xs', className: ['h-8', 'w-8'] },
  ],
  defaultVariants: {
    size: 'md',
    border: false,
  },
})

export type ResourceAvatarProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> &
  VariantProps<typeof resourceAvatarVariants> &
  (
    | {
        service: AnyService
      }
    | { environment: Environment }
    | { cluster: Cluster }
    | { project: Project }
  )

export const ResourceAvatar = forwardRef<ElementRef<'span'>, ResourceAvatarProps>(function ResourceAvatar(
  { className, size, border, ..._props },
  forwardedRef
) {
  const { icon, props } = match(_props)
    .returnType<{
      icon: string | undefined
      props: Omit<ComponentPropsWithoutRef<'span'>, 'children'>
    }>()
    .with({ cluster: P.not(P.nullish) }, ({ cluster, ...props }) => ({
      icon: match(cluster.cloud_provider)
        .with('ON_PREMISE', () => IconEnum.KUBERNETES)
        .otherwise((cloud_provider) => cloud_provider),
      props,
    }))
    .with({ project: P.not(P.nullish) }, ({ project, ...props }) => ({ icon: 'ENVIRONMENT', props }))
    .with({ environment: P.not(P.nullish) }, ({ environment, ...props }) => ({ icon: 'SERVICES', props }))
    .with({ service: P.not(P.nullish) }, ({ service, ...props }) => ({
      icon: match(service)
        .with({ serviceType: 'HELM' }, () => 'HELM')
        .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, () => IconEnum.LIFECYCLE_JOB)
        .with({ serviceType: 'JOB', job_type: 'CRON' }, () => IconEnum.CRON_JOB)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, () => IconEnum.APPLICATION)
        .with({ serviceType: 'DATABASE' }, () => 'DATABASE')
        .exhaustive(),
      props,
    }))
    .exhaustive()

  return (
    icon && (
      <span ref={forwardedRef} {...props} className={twMerge(resourceAvatarVariants({ size, border }), className)}>
        <Icon className={twMerge(resourceAvatarIconVariants({ size, border }))} name={icon} />
      </span>
    )
  )
})
