import { useParams } from '@tanstack/react-router'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { DatabaseModeEnum, type Environment } from 'qovery-typescript-axios'
import { type ReactNode, useMemo, useState } from 'react'
import { OutputVariables } from '@qovery/domains/variables/feature'
import { Heading, Icon, Link, Section, TabsPrimitives } from '@qovery/shared/ui'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useService } from '../hooks/use-service/use-service'
import { ScaledObjectStatus, type ScaledObjectStatusDto } from '../keda/scaled-object-status/scaled-object-status'
import { NeedRedeployFlag } from '../need-redeploy-flag/need-redeploy-flag'
import { InstanceMetrics } from './instance-metrics/instance-metrics'
import { ServiceHeader } from './service-header/service-header'
import { ServiceInstance } from './service-instance/service-instance'
import { ServiceLastDeployment } from './service-last-deployment/service-last-deployment'

const { Tabs } = TabsPrimitives

export interface ServiceOverviewProps {
  environment?: Environment
  hasNoMetrics?: boolean
  terraformResourcesSection?: ReactNode
  observabilityCallout?: ReactNode
}

export function ServiceOverview({
  environment,
  hasNoMetrics = false,
  terraformResourcesSection,
  observabilityCallout,
}: ServiceOverviewProps) {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId })
  const [activeTab, setActiveTab] = useState('variables')
  const isKedaFeatureEnabled = useFeatureFlagVariantKey('keda')
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })

  const isDatabaseManaged = useMemo(
    () =>
      service?.serviceType === 'DATABASE' &&
      (service as { mode?: DatabaseModeEnum })?.mode === DatabaseModeEnum.MANAGED,
    [service]
  )
  const isLifecycleJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'LIFECYCLE', [service])
  const isTerraformService = useMemo(() => service?.serviceType === 'TERRAFORM', [service])
  const isKedaAutoscaling = useMemo(
    () =>
      isKedaFeatureEnabled &&
      (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
      service.autoscaling?.mode === 'KEDA',
    [service, isKedaFeatureEnabled]
  )
  const scaledObject = useMemo<ScaledObjectStatusDto | null>(() => {
    if (
      !isKedaAutoscaling ||
      typeof runningStatus !== 'object' ||
      runningStatus === null ||
      !('scaled_object' in runningStatus)
    ) {
      return null
    }

    const candidate = runningStatus.scaled_object
    if (!candidate || typeof candidate !== 'object' || !('name' in candidate) || typeof candidate.name !== 'string') {
      return null
    }

    return candidate as ScaledObjectStatusDto
  }, [isKedaAutoscaling, runningStatus])

  if (!service || !environment) {
    return null
  }

  if (service?.serviceType === 'DATABASE') {
    return (
      <>
        <NeedRedeployFlag />
        <Section className="flex flex-1 grow flex-col gap-6 overflow-auto px-10 py-7">
          <ServiceHeader environment={environment} serviceId={service.id} />
          {isDatabaseManaged ? (
            <div className="flex flex-col items-center gap-1 border border-neutral bg-surface-neutral-subtle py-10 text-sm text-neutral">
              <span className="font-medium">Metrics for managed databases are not available</span>
              <span className="text-neutral-subtle">Check your cloud provider console to get more information</span>
            </div>
          ) : (
            <Section className="gap-3">
              <Heading>Instances</Heading>
              <InstanceMetrics environmentId={environment.id} serviceId={service.id} />
            </Section>
          )}
        </Section>
      </>
    )
  }

  return (
    <>
      <NeedRedeployFlag />
      <div className="flex min-h-0 flex-1 grow flex-col gap-6 pb-24">
        <div className="flex shrink-0 flex-col gap-5 py-8 text-sm">
          <Section className="gap-8">
            <ServiceHeader environment={environment} serviceId={service.id} />
            {hasNoMetrics && observabilityCallout}
            <Section className="gap-3">
              <div className="flex items-center justify-between gap-2">
                <Heading>Last deployment</Heading>
                <Link
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments"
                  params={{
                    organizationId: environment.organization.id,
                    projectId: environment.project.id,
                    environmentId: environment.id,
                    serviceId: service.id,
                  }}
                  color="neutral"
                  size="ssm"
                  className="gap-0.5 text-neutral-subtle hover:text-neutral"
                >
                  See all deploys
                  <Icon iconName="angle-right" className="text-ssm" />
                </Link>
              </div>
              <ServiceLastDeployment serviceId={service.id} serviceType={service?.serviceType} service={service} />
            </Section>
            {!isTerraformService && (
              <Section className="gap-3">
                <Heading>Instances</Heading>
                <ServiceInstance service={service} />
              </Section>
            )}
            {isKedaAutoscaling && scaledObject && (
              <Section className="gap-3">
                <Heading>Scaled Object (KEDA)</Heading>
                <ScaledObjectStatus scaledObject={scaledObject} />
              </Section>
            )}
            {isLifecycleJob && (
              <Section className="gap-3">
                <Heading>Output Variables</Heading>
                <div className="overflow-hidden rounded-lg border border-neutral">
                  <OutputVariables className="border-none" serviceId={service.id} serviceType={service?.serviceType} />
                </div>
              </Section>
            )}
            {isTerraformService && (
              <Section className="gap-3">
                <Tabs.Root
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full overflow-hidden rounded-lg border border-neutral"
                >
                  <Tabs.List className="bg-surface-neutral-subtle">
                    <Tabs.Trigger value="variables">Output Variables</Tabs.Trigger>
                    <Tabs.Trigger value="resources">Infrastructure Resources</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="variables">
                    <OutputVariables
                      serviceId={service.id}
                      serviceType={service?.serviceType}
                      className="table-fixed"
                    />
                  </Tabs.Content>
                  <Tabs.Content value="resources">{terraformResourcesSection ?? null}</Tabs.Content>
                </Tabs.Root>
              </Section>
            )}
          </Section>
        </div>
      </div>
    </>
  )
}
