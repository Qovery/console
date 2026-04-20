import { type PropsWithChildren, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { Button, Chart, Heading, Icon, Section, Tooltip, useModal } from '@qovery/shared/ui'
import { AlertRulesOverview } from '../../alerting/alert-rules-overview/alert-rules-overview'
import { CreateKeyAlertsModal } from '../../alerting/create-key-alerts-modal/create-key-alerts-modal'
import { useEnvironment } from '../../hooks/use-environment/use-environment'

interface ServiceAlertingContentProps extends PropsWithChildren {
  organizationId: string
  projectId: string
  service: AnyService
}

function ServiceAlertingContent({ organizationId, projectId, service, children }: ServiceAlertingContentProps) {
  const { openModal, closeModal } = useModal()
  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: service?.environment?.id,
    serviceId: service?.id,
  })

  const createKeyAlertsModal = () => {
    openModal({
      content: (
        <CreateKeyAlertsModal
          onClose={closeModal}
          service={service}
          organizationId={organizationId}
          projectId={projectId}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const canCreateAlerts = useMemo(() => {
    return (
      deploymentStatus?.service_deployment_status !== undefined &&
      deploymentStatus?.service_deployment_status !== 'NEVER_DEPLOYED'
    )
  }, [deploymentStatus])

  return (
    <Section className="w-full px-8 py-6 pb-20">
      <div className="mb-8 border-b border-neutral-250">
        <div className="flex w-full items-center justify-between pb-5">
          <Heading level={1}>Alert rules</Heading>
          <Tooltip content="You need to deploy your service to create alerts" disabled={canCreateAlerts}>
            <div>
              <Button
                variant="outline"
                color="neutral"
                size="md"
                className="gap-1.5"
                onClick={createKeyAlertsModal}
                disabled={!canCreateAlerts}
              >
                <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
                New alert
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
      <AlertRulesOverview organizationId={organizationId} service={service} onCreateKeyAlerts={createKeyAlertsModal}>
        {children}
      </AlertRulesOverview>
    </Section>
  )
}

export function ServiceAlerting({ children }: PropsWithChildren) {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  if (!environment || !service)
    return (
      <div className="flex h-full w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )

  return (
    <ServiceAlertingContent organizationId={organizationId} projectId={projectId} service={service}>
      {children}
    </ServiceAlertingContent>
  )
}

export default ServiceAlerting
