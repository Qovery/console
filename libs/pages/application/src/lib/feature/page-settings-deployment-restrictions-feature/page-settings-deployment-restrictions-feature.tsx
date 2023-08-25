import {
  type ApplicationDeploymentRestriction,
  type ApplicationDeploymentRestrictionRequest,
} from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import {
  useCreateDeploymentRestriction,
  useDeleteDeploymentRestriction,
  useDeploymentRestrictions,
  useEditDeploymentRestriction,
} from '@qovery/domains/services/feature'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  InputText,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsDeploymentRestrictionsFeature() {
  const { applicationId = '' } = useParams()
  const serviceParams = {
    serviceId: applicationId,
    serviceType: 'APPLICATION' as const,
  }
  const { data: deploymentRestrictions = [] } = useDeploymentRestrictions(serviceParams)
  const { mutate: createRestriction } = useCreateDeploymentRestriction(serviceParams)
  const { mutate: editRestriction } = useEditDeploymentRestriction(serviceParams)
  const { mutate: deleteRestriction } = useDeleteDeploymentRestriction(serviceParams)
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const handleCreate = () => {
    openModal({
      content: (
        <CrudModalFeature
          onClose={closeModal}
          onSubmit={(payload: ApplicationDeploymentRestrictionRequest) => {
            createRestriction({
              ...serviceParams,
              payload,
            })
            closeModal()
          }}
        />
      ),
    })
  }

  const handleEdit = (deploymentRestriction: ApplicationDeploymentRestriction) => {
    openModal({
      content: (
        <CrudModalFeature
          onClose={closeModal}
          deploymentRestriction={deploymentRestriction}
          onSubmit={(payload: ApplicationDeploymentRestrictionRequest) => {
            editRestriction({
              ...serviceParams,
              deploymentRestrictionId: deploymentRestriction.id,
              payload,
            })
            closeModal()
          }}
        />
      ),
    })
  }

  const handleDelete = (deploymentRestriction: ApplicationDeploymentRestriction) => {
    openModalConfirmation({
      title: 'Delete Restriction',
      name: deploymentRestriction.id,
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
        <div className="flex justify-between mb-10">
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
        {deploymentRestrictions?.length > 0 ? (
          <BlockContent title="Deployment restrictions">
            <div className="flex flex-col gap-3">
              {deploymentRestrictions.map((deploymentRestriction, i) => {
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
                      className="text-neutral-400"
                      style={ButtonIconStyle.FLAT}
                      onClick={() => handleEdit(deploymentRestriction)}
                      dataTestId="edit"
                      icon={IconAwesomeEnum.WHEEL}
                    />
                    <ButtonIcon
                      className="text-neutral-400"
                      onClick={() => handleDelete(deploymentRestriction)}
                      dataTestId="remove"
                      icon={IconAwesomeEnum.TRASH}
                      style={ButtonIconStyle.FLAT}
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
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDeploymentRestrictionsFeature
