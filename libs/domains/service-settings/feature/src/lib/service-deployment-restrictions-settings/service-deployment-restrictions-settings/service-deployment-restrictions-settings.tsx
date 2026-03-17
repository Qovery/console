import { useParams } from '@tanstack/react-router'
import {
  type ApplicationDeploymentRestriction,
  type TerraformDeploymentRestrictionResponse,
} from 'qovery-typescript-axios'
import { Suspense } from 'react'
import {
  type AnyService,
  type Application,
  type Helm,
  type Job,
  type Terraform,
} from '@qovery/domains/services/data-access'
import { useDeleteDeploymentRestriction, useDeploymentRestrictions, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { isHelmGitSource } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  EmptyState,
  Icon,
  LoaderSpinner,
  Section,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { ServiceDeploymentRestrictionsModal } from '../service-deployment-restrictions-modal/service-deployment-restrictions-modal'

type DeploymentRestriction = ApplicationDeploymentRestriction | TerraformDeploymentRestrictionResponse
type SupportedService = Application | Job | Helm | Terraform

const ContentFallback = () => (
  <div className="flex justify-center py-12">
    <LoaderSpinner />
  </div>
)

const isSupportedService = (service?: AnyService): service is SupportedService =>
  service?.serviceType === 'APPLICATION' ||
  service?.serviceType === 'JOB' ||
  service?.serviceType === 'TERRAFORM' ||
  (service?.serviceType === 'HELM' && isHelmGitSource(service.source))

export function ServiceDeploymentRestrictionsSettings() {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { data: service } = useService({ environmentId, serviceId })

  if (service && !isSupportedService(service)) {
    return null
  }

  const openCrudModal = (deploymentRestriction?: DeploymentRestriction) => {
    if (!isSupportedService(service)) {
      return
    }

    openModal({
      content: (
        <ServiceDeploymentRestrictionsModal
          serviceId={service.id}
          serviceType={service.serviceType}
          deploymentRestriction={deploymentRestriction}
          onClose={closeModal}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  return (
    <Section className="p-8">
      <div className="space-y-6">
        <SettingsHeading
          title="Deployment Restrictions"
          description="Specify which changes in your repository should trigger or not an auto-deploy of your service."
        >
          <Button
            size="md"
            variant="solid"
            color="brand"
            type="button"
            className="gap-2"
            onClick={() => openCrudModal()}
            disabled={!isSupportedService(service)}
          >
            New Restriction
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </SettingsHeading>

        <div className="max-w-content-with-navigation-left">
          {!service ? (
            <ContentFallback />
          ) : (
            <Suspense fallback={<ContentFallback />}>
              <ServiceDeploymentRestrictionsSettingsInner
                environmentId={environmentId}
                serviceId={serviceId}
                onOpenCrudModal={openCrudModal}
              />
            </Suspense>
          )}
        </div>
      </div>
    </Section>
  )
}

interface ServiceDeploymentRestrictionsSettingsInnerProps {
  environmentId: string
  serviceId: string
  onOpenCrudModal: (deploymentRestriction?: DeploymentRestriction) => void
}

function ServiceDeploymentRestrictionsSettingsInner({
  environmentId,
  serviceId,
  onOpenCrudModal,
}: ServiceDeploymentRestrictionsSettingsInnerProps) {
  const { openModalConfirmation } = useModalConfirmation()
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { data: deploymentRestrictions = [], isLoading: isLoadingDeploymentRestrictions } = useDeploymentRestrictions({
    serviceId,
    serviceType: isSupportedService(service) ? service.serviceType : 'APPLICATION',
  })
  const { mutate: deleteRestriction } = useDeleteDeploymentRestriction()

  if (!isSupportedService(service)) {
    return null
  }

  const onDeleteRestriction = (deploymentRestriction: DeploymentRestriction) => {
    openModalConfirmation({
      title: 'Delete restriction',
      name: `${deploymentRestriction.mode}/${deploymentRestriction.type}/${deploymentRestriction.value}`,
      confirmationMethod: 'action',
      action: () => {
        deleteRestriction({
          serviceId,
          serviceType: service.serviceType,
          deploymentRestrictionId: deploymentRestriction.id,
        })
      },
    })
  }

  if (isLoadingDeploymentRestrictions) {
    return <ContentFallback />
  }

  if (deploymentRestrictions.length === 0) {
    return (
      <EmptyState
        icon="cart-flatbed"
        title="No deployment restrictions are set"
        description="Adding deployment restrictions allows you to control the auto-deploy feature and determine when a commit on your repository should be auto-deployed or not."
      />
    )
  }

  return (
    <BlockContent title="Deployment restrictions" classNameContent="p-0">
      {deploymentRestrictions.map((deploymentRestriction, index) => (
        <div
          key={deploymentRestriction.id}
          className="flex w-full items-center justify-between gap-2 border-b border-neutral px-4 py-3 last:border-0"
        >
          <div className="flex flex-col">
            <h2 className="mb-1 text-xs font-medium text-neutral">Restriction #{index + 1}</h2>
            <div className="flex gap-3 text-xs text-neutral-subtle">
              <p>
                Mode: <span className="text-neutral">{deploymentRestriction.mode}</span>
              </p>
              <p>
                Path: <span className="text-neutral">{deploymentRestriction.value}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              color="neutral"
              size="md"
              type="button"
              onClick={() => onOpenCrudModal(deploymentRestriction)}
              aria-label="Edit restriction"
              iconOnly
            >
              <Icon iconName="gear" iconStyle="regular" />
            </Button>
            <Button
              variant="outline"
              color="neutral"
              size="md"
              type="button"
              onClick={() => onDeleteRestriction(deploymentRestriction)}
              aria-label="Delete restriction"
              iconOnly
            >
              <Icon iconName="trash" iconStyle="regular" />
            </Button>
          </div>
        </div>
      ))}
    </BlockContent>
  )
}

export default ServiceDeploymentRestrictionsSettings
