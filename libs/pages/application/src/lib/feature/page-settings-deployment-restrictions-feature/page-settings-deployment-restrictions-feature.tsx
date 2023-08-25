import { type ApplicationDeploymentRestriction } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useFetchEnvironmentDeploymentRule } from '@qovery/domains/environment'
import { useDeleteDeploymentRestriction, useDeploymentRestrictions } from '@qovery/domains/services/feature'
import {
  BannerBox,
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  InputText,
  LoaderSpinner,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsDeploymentRestrictionsFeature() {
  const { projectId = '', environmentId = '', applicationId = '' } = useParams()
  const serviceParams = {
    serviceId: applicationId,
    serviceType: 'APPLICATION' as const,
  }
  const { data: deploymentRestrictions = [], isLoading: isLoadingDeploymentRestrictions } =
    useDeploymentRestrictions(serviceParams)
  const { mutate: deleteRestriction } = useDeleteDeploymentRestriction(serviceParams)
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: environmentDeploymentRules, isLoading: isLoadingEnvironmentDeploymentRule } =
    useFetchEnvironmentDeploymentRule(projectId, environmentId)
  const isAutoDeployActive = environmentDeploymentRules?.auto_deploy

  const handleCreate = () => {
    openModal({
      content: <CrudModalFeature onClose={closeModal} {...serviceParams} />,
    })
  }

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
          serviceId: applicationId,
          serviceType: 'APPLICATION',
          deploymentRestrictionId: deploymentRestriction.id,
        })
      },
    })
  }

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
          <Button dataTestId="add-button" onClick={handleCreate} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            New Restriction
          </Button>
        </div>

        {isLoadingEnvironmentDeploymentRule || isLoadingDeploymentRestrictions ? (
          <LoaderSpinner className="w-6" />
        ) : (
          <>
            {!isAutoDeployActive && (
              <BannerBox
                className="mb-5"
                title="Auto deploy is not active"
                message="These rules are applied only if the auto-deploy feature is activated. Activate it first on the “General” settings of your environment"
              />
            )}

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

export default PageSettingsDeploymentRestrictionsFeature
