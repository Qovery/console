import { type ApplicationDeploymentRestriction } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { type ApplicationType, type HelmType, type JobType } from '@qovery/domains/services/data-access'
import {
  useDeleteDeploymentRestriction,
  useDeploymentRestrictions,
  useServiceType,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  EmptyState,
  Icon,
  InputText,
  LoaderSpinner,
  Section,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

/**
 * TODO: Refactor this component into smaller ones.
 * This must be done later on when we will have to add deployment restrictions
 * into creation form flow
 **/

export function PageSettingsDeploymentRestrictionsFeature() {
  const { projectId, environmentId, applicationId: serviceId } = useParams()
  const { data: serviceType, isLoading: isLoadingServiceType } = useServiceType({ environmentId, serviceId })
  const { openModal, closeModal } = useModal()
  if (!projectId || !environmentId || !serviceId || (!isLoadingServiceType && !serviceType)) {
    return null
  }

  const isValidServiceType = serviceType === 'APPLICATION' || serviceType === 'JOB' || serviceType === 'HELM'

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Deployment Restrictions"
          description="Specify which changes in your repository should trigger or not an auto-deploy of your application"
        >
          {!isLoadingServiceType && isValidServiceType && (
            <Button
              data-testid="add-button"
              size="md"
              className="gap-2"
              onClick={() => {
                openModal({
                  content: <CrudModalFeature onClose={closeModal} serviceId={serviceId} serviceType={serviceType} />,
                })
              }}
            >
              New Restriction
              <Icon iconName="plus-circle" iconStyle="regular" />
            </Button>
          )}
        </SettingsHeading>

        {!isLoadingServiceType && isValidServiceType ? (
          <PageSettingsDeploymentRestrictionsFeatureInner serviceId={serviceId} serviceType={serviceType} />
        ) : (
          <div className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        )}
      </Section>
    </div>
  )
}

interface PageSettingsDeploymentRestrictionsFeatureInnerProps {
  serviceId: string
  serviceType: ApplicationType | JobType | HelmType
}

function PageSettingsDeploymentRestrictionsFeatureInner({
  serviceId,
  serviceType,
}: PageSettingsDeploymentRestrictionsFeatureInnerProps) {
  const serviceParams = {
    serviceId,
    serviceType,
  }
  const { data: deploymentRestrictions = [], isLoading: isLoadingDeploymentRestrictions } =
    useDeploymentRestrictions(serviceParams)
  const { mutate: deleteRestriction } = useDeleteDeploymentRestriction()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const handleEdit = (deploymentRestriction: ApplicationDeploymentRestriction) => {
    openModal({
      content: (
        <CrudModalFeature onClose={closeModal} deploymentRestriction={deploymentRestriction} {...serviceParams} />
      ),
    })
  }

  const handleDelete = (deploymentRestriction: ApplicationDeploymentRestriction) => {
    openModalConfirmation({
      title: 'Delete Restriction',
      name: `${deploymentRestriction.mode}/${deploymentRestriction.type}/${deploymentRestriction.value}`,
      isDelete: true,
      action() {
        deleteRestriction({
          serviceId,
          serviceType,
          deploymentRestrictionId: deploymentRestriction.id,
        })
      },
    })
  }

  return isLoadingDeploymentRestrictions ? (
    <div className="flex justify-center">
      <LoaderSpinner className="w-6" />
    </div>
  ) : deploymentRestrictions?.length > 0 ? (
    <BlockContent title="Deployment restrictions">
      <div className="flex flex-col gap-3">
        {deploymentRestrictions.map((deploymentRestriction) => {
          const { id, type, mode, value } = deploymentRestriction
          return (
            <div key={id} className="flex w-full items-center justify-between gap-3">
              <InputText name={`mode_${id}`} className="flex-1 shrink-0 grow" label="Mode" value={mode} disabled />
              <InputText name={`type_${id}`} className="flex-1 shrink-0 grow" label="Type" value={type} disabled />
              <InputText name={`value_${id}`} className="flex-1 shrink-0 grow" label="Value" value={value} disabled />
              <Button
                data-testid="edit"
                className="h-[52px] w-[52px] justify-center"
                variant="surface"
                color="neutral"
                onClick={() => handleEdit(deploymentRestriction)}
              >
                <Icon iconName="gear" className="text-sm" />
              </Button>
              <Button
                data-testid="remove"
                className="h-[52px] w-[52px] justify-center"
                variant="surface"
                color="neutral"
                onClick={() => handleDelete(deploymentRestriction)}
              >
                <Icon iconName="trash" className="text-sm" />
              </Button>
            </div>
          )
        })}
      </div>
    </BlockContent>
  ) : (
    <EmptyState
      title="No deployment restrictions are set"
      description="Adding deployment restrictions allows you to control the auto-deploy feature and determine when a commit on your repository should be auto-deployed or not."
    />
  )
}

export default PageSettingsDeploymentRestrictionsFeature
