import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useMemo, useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { OutputVariables } from '@qovery/domains/variables/feature'
import { ExternalLink, Heading, Icon, Section, TabsPrimitives } from '@qovery/shared/ui'
import { ScaledObjectStatus } from '../keda/scaled-object-status/scaled-object-status'
import { PodStatusesCallout } from '../pod-statuses-callout/pod-statuses-callout'
import { PodsMetrics } from '../pods-metrics/pods-metrics'
import { ObservabilityCallout } from './observability-callout'
import { ServiceHeader } from './service-header/service-header'
import { ServiceLastDeployment } from './service-last-deployment/service-last-deployment'

const { Tabs } = TabsPrimitives

export interface ServiceOverviewProps {
  serviceId: string
  environmentId: string
  service: AnyService
  hasNoMetrics?: boolean
  /** Optional slot for Terraform "Infrastructure Resources" tab content (avoids circular dep with service-terraform). */
  terraformResourcesSection?: ReactNode
  /** Optional modal content for Observability callout "Discover feature" (avoids circular dep with observability). */
  observabilityCalloutModalContent?: ReactNode
}

export function ServiceOverview({
  serviceId,
  environmentId,
  service,
  hasNoMetrics = false,
  terraformResourcesSection,
  observabilityCalloutModalContent,
}: ServiceOverviewProps) {
  const [activeTab, setActiveTab] = useState('variables')
  const isKedaFeatureEnabled = useFeatureFlagVariantKey('keda')

  const isDatabaseManaged = useMemo(
    () =>
      service?.serviceType === 'DATABASE' &&
      (service as { mode?: DatabaseModeEnum })?.mode === DatabaseModeEnum.MANAGED,
    [service]
  )
  const isLifecycleJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'LIFECYCLE', [service])
  const isTerraformService = useMemo(() => service?.serviceType === 'TERRAFORM', [service])
  const isCronJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'CRON', [service])
  const isKedaAutoscaling = useMemo(
    () =>
      isKedaFeatureEnabled &&
      (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
      service.autoscaling?.mode === 'KEDA',
    [service, isKedaFeatureEnabled]
  )
  const showApplicationOverview = useMemo(
    () =>
      service?.serviceType === 'APPLICATION' ||
      service?.serviceType === 'CONTAINER' ||
      service?.serviceType === 'JOB' ||
      service?.serviceType === 'TERRAFORM',
    [service?.serviceType]
  )

  if (service?.serviceType === 'DATABASE') {
    return (
      <div className="flex flex-1 grow flex-col gap-6 overflow-auto px-10 py-7">
        <ServiceHeader environmentId={environmentId} serviceId={serviceId} />
        {isDatabaseManaged ? (
          <div className="flex flex-col items-center gap-1 border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
            <span className="font-medium">Metrics for managed databases are not available</span>
            <span>Check your cloud provider console to get more information</span>
          </div>
        ) : (
          <>
            <PodStatusesCallout environmentId={environmentId} serviceId={serviceId} />
            <PodsMetrics environmentId={environmentId} serviceId={serviceId} />
          </>
        )}
      </div>
    )
  }

  if (!showApplicationOverview) {
    return null
  }

  return (
    <div className="flex min-h-0 flex-1 grow flex-col gap-6 pb-24">
      <div className="flex shrink-0 flex-col gap-5 py-8 text-sm">
        <Section className="gap-8">
          <ServiceHeader environmentId={environmentId} serviceId={serviceId} />
          <Section className="gap-3">
            <Heading>Last deployment</Heading>
            <ServiceLastDeployment serviceId={serviceId} serviceType={service?.serviceType} service={service} />
          </Section>
        </Section>

        {hasNoMetrics && <ObservabilityCallout discoverModalContent={observabilityCalloutModalContent} />}
        <PodStatusesCallout environmentId={environmentId} serviceId={serviceId} />
        {!isTerraformService && (
          <PodsMetrics environmentId={environmentId} serviceId={serviceId}>
            {isCronJob && (
              <div className="grid grid-cols-[min-content_1fr] gap-x-3 gap-y-1 rounded border border-neutral-250 bg-neutral-100 p-3 text-xs text-neutral-350">
                <Icon className="row-span-2" iconName="circle-info" iconStyle="regular" />
                <p>
                  The number of past Completed or Failed job execution retained in the history and their TTL can be
                  customized in the advanced settings.
                </p>
                <ExternalLink
                  className="text-xs"
                  href="https://www.qovery.com/docs/configuration/service-advanced-settings#cronjob-failed-jobs-history-limit"
                >
                  See documentation
                </ExternalLink>
              </div>
            )}
          </PodsMetrics>
        )}
        {isKedaAutoscaling && <ScaledObjectStatus environmentId={environmentId} serviceId={serviceId} />}
        {isLifecycleJob && <OutputVariables serviceId={serviceId} serviceType={service?.serviceType} />}
        {isTerraformService && (
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="border-neutral-200x w-full rounded-lg border"
          >
            <Tabs.List className="rounded-t-lg border-b border-neutral-200 bg-neutral-100">
              <Tabs.Trigger value="variables">Output Variables</Tabs.Trigger>
              <Tabs.Trigger value="resources">Infrastructure Resources</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="variables">
              <OutputVariables serviceId={serviceId} serviceType={service?.serviceType} className="table-fixed" />
            </Tabs.Content>
            <Tabs.Content value="resources">{terraformResourcesSection ?? null}</Tabs.Content>
          </Tabs.Root>
        )}
      </div>
    </div>
  )
}
