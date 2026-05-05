import { type Environment } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { Heading, Section, Skeleton } from '@qovery/shared/ui'
import { InstanceMetricsSkeleton } from './instance-metrics/instance-metrics-skeleton'
import { ServiceLastDeploymentSkeleton } from './service-last-deployment/service-last-deployment'

export interface ServiceOverviewSkeletonProps {
  environment?: Environment
  hasNoMetrics?: boolean
  observabilityCallout?: ReactNode
}

export function ServiceOverviewSkeleton({ hasNoMetrics = false, observabilityCallout }: ServiceOverviewSkeletonProps) {
  return (
    <div className="flex min-h-0 flex-1 grow flex-col gap-6 pb-24">
      <div className="flex shrink-0 flex-col gap-5 py-8 text-sm">
        <Section className="gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton width={32} height={32} show rounded />
                  <Skeleton width={100} height={16} show />
                  <Skeleton width={100} height={16} show />
                  <span className="mx-2 h-4 w-px bg-surface-neutral-component" />
                  <Skeleton width={100} height={16} show />
                </div>
                <Skeleton width={100} height={16} show />
              </div>
              <Skeleton width={500} height={16} show />
              <div className="mt-3 flex items-center gap-1">
                <Skeleton width={100} height={16} show />
                <Skeleton width={100} height={16} show />
                <Skeleton width={100} height={16} show />
                <Skeleton width={100} height={16} show />
              </div>
            </div>
            <hr className="border-neutral" />
          </div>
          {hasNoMetrics && observabilityCallout}
          <Section className="gap-3">
            <div className="flex items-center justify-between gap-2">
              <Heading>Last deployment</Heading>
              <Skeleton width={100} height={16} show />
            </div>
            <ServiceLastDeploymentSkeleton />
          </Section>
          <Section className="gap-3">
            <Heading>Instances</Heading>
            <InstanceMetricsSkeleton />
          </Section>
        </Section>
      </div>
    </div>
  )
}

export default ServiceOverviewSkeleton
