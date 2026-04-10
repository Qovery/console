import { useParams } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type ReactNode, Suspense, useMemo, useState } from 'react'
import { OutputVariables } from '@qovery/domains/variables/feature'
import { Heading, Icon, Link, Navbar, Section } from '@qovery/shared/ui'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useService } from '../hooks/use-service/use-service'
import { ScaledObjectStatus, type ScaledObjectStatusDto } from '../keda/scaled-object-status/scaled-object-status'
import { NeedRedeployFlag } from '../need-redeploy-flag/need-redeploy-flag'
import { ServiceHeader } from './service-header/service-header'
import { ServiceInstance } from './service-instance/service-instance'
import { ServiceLastDeployment } from './service-last-deployment/service-last-deployment'
import { ServiceOverviewSkeleton } from './service-overview-skeleton'

export interface ServiceOverviewProps {
  environment?: Environment
  hasNoMetrics?: boolean
  terraformResourcesSection?: ReactNode
  observabilityCallout?: ReactNode
}

function ServiceOverviewContent({
  environment,
  hasNoMetrics = false,
  terraformResourcesSection,
  observabilityCallout,
}: ServiceOverviewProps) {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const [activeTab, setActiveTab] = useState('variables')
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })

  const isLifecycleJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'LIFECYCLE', [service])
  const isTerraformService = useMemo(() => service?.serviceType === 'TERRAFORM', [service])
  const isKedaAutoscaling = useMemo(
    () =>
      (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
      service.autoscaling?.mode === 'KEDA',
    [service]
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

  return (
    <>
      <NeedRedeployFlag />
      <div className="flex min-h-0 flex-1 grow flex-col gap-6 pb-24">
        <div className="flex shrink-0 flex-col gap-5 pb-8 pt-6 text-sm">
          <Section className="gap-8">
            <ServiceHeader environment={environment} serviceId={service.id} service={service} />
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
                  See all deployments
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
                <div>
                  <div className="overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
                    <div className="no-scrollbar overflow-x-auto pb-2">
                      <Navbar.Root activeId={activeTab} className="ml-3">
                        <Navbar.Item
                          id="variables"
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            setActiveTab('variables')
                          }}
                        >
                          Output variables
                        </Navbar.Item>
                        <Navbar.Item
                          id="resources"
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            setActiveTab('resources')
                          }}
                        >
                          Infrastructure resources
                        </Navbar.Item>
                      </Navbar.Root>
                    </div>
                  </div>
                  <div className="relative -top-2 rounded-lg bg-background">
                    <div className="overflow-hidden rounded-lg border border-neutral">
                      {activeTab === 'variables' ? (
                        <OutputVariables
                          serviceId={service.id}
                          serviceType={service?.serviceType}
                          className="table-fixed"
                        />
                      ) : (
                        terraformResourcesSection ?? null
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            )}
          </Section>
        </div>
      </div>
    </>
  )
}

export function ServiceOverview(props: ServiceOverviewProps) {
  return (
    <Suspense fallback={<ServiceOverviewSkeleton {...props} />}>
      <ServiceOverviewContent {...props} />
    </Suspense>
  )
}
