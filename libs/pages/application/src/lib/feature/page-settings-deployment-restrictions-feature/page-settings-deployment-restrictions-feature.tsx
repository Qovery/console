import { type ApplicationDeploymentRestriction } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { type ApplicationType, type JobType, isApplicationType, isJobType } from '@qovery/domains/services/data-access'
import {
  useDeleteDeploymentRestriction,
  useDeploymentRestrictions,
  useServiceType,
} from '@qovery/domains/services/feature'
import {
  BlockContent,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacy,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  InputText,
  LoaderSpinner,
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

  const isValidServiceType = serviceType && (isApplicationType(serviceType) || isJobType(serviceType))

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <div className="flex justify-between mb-2 items-center">
              <h3 className="text-neutral-400 text-lg">Deployment Restrictions</h3>
            </div>

            <p className="text-sm text-neutral-400 max-w-lg">
              Specify which changes in your repository should trigger or not an auto-deploy of your application
            </p>
          </div>
          {!isLoadingServiceType && isValidServiceType && (
            <ButtonLegacy
              dataTestId="add-button"
              onClick={() => {
                openModal({
                  content: <CrudModalFeature onClose={closeModal} serviceId={serviceId} serviceType={serviceType} />,
                })
              }}
              iconRight={IconAwesomeEnum.CIRCLE_PLUS}
            >
              New Restriction
            </ButtonLegacy>
          )}
        </div>

        {!isLoadingServiceType && isValidServiceType ? (
          <PageSettingsDeploymentRestrictionsFeatureInner serviceId={serviceId} serviceType={serviceType} />
        ) : (
          <div className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#auto-deploy',
            linkLabel: 'How to configure the deployment restrictions',
            external: true,
          },
        ]}
      />
    </div>
  )
}

interface PageSettingsDeploymentRestrictionsFeatureInnerProps {
  serviceId: string
  serviceType: ApplicationType | JobType
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
  const { mutate: deleteRestriction } = useDeleteDeploymentRestriction(serviceParams)
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

  return (
    <>
      {isLoadingDeploymentRestrictions ? (
        <div className="flex justify-center">
          <LoaderSpinner className="w-6" />
        </div>
      ) : (
        <>
          {deploymentRestrictions?.length > 0 ? (
            <BlockContent title="Deployment restrictions">
              <div className="flex flex-col gap-3">
                {deploymentRestrictions.map((deploymentRestriction) => {
                  const { id, type, mode, value } = deploymentRestriction
                  return (
                    <div key={id} className="flex justify-between w-full items-center gap-3">
                      <InputText
                        name={`mode_${id}`}
                        className="shrink-0 grow flex-1"
                        label="Mode"
                        value={mode}
                        disabled
                      />
                      <InputText
                        name={`type_${id}`}
                        className="shrink-0 grow flex-1"
                        label="Type"
                        value={type}
                        disabled
                      />
                      <InputText
                        name={`value_${id}`}
                        className="shrink-0 grow flex-1"
                        label="Value"
                        value={value}
                        disabled
                      />
                      <ButtonIcon
                        className="!bg-transparent hover:!bg-neutral-200 !w-[52px] !h-[52px]"
                        style={ButtonIconStyle.STROKED}
                        onClick={() => handleEdit(deploymentRestriction)}
                        dataTestId="edit"
                        icon={IconAwesomeEnum.WHEEL}
                      />
                      <ButtonIcon
                        className="!bg-transparent hover:!bg-neutral-200 !w-[52px] !h-[52px]"
                        onClick={() => handleDelete(deploymentRestriction)}
                        dataTestId="remove"
                        icon={IconAwesomeEnum.TRASH}
                        style={ButtonIconStyle.STROKED}
                      />
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
          )}
        </>
      )}
    </>
  )
}

export default PageSettingsDeploymentRestrictionsFeature
