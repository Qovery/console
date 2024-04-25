import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeployEnvironment } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { CreateUpdateVariableModal, VariableList, useDeleteVariable } from '@qovery/domains/variables/feature'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { ToastEnum, toast, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ApplicationContext } from '../../ui/container/container'

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const { environmentId = '', organizationId = '', projectId = '', applicationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: service } = useService({
    environmentId,
    serviceId: applicationId,
  })

  const scope = match(service?.serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => undefined)

  const { mutateAsync: deleteVariable } = useDeleteVariable()
  const { mutate: actionRedeployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId),
  })

  const serviceType = service?.serviceType

  const { showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues } =
    useContext(ApplicationContext)

  useEffect(() => {
    setShowHideAllEnvironmentVariablesValues(false)
  }, [applicationId, serviceType])

  return (
    <div className="mt-2 bg-white rounded-sm flex flex-1">
      <div className="grow">
        {scope && (
          <VariableList
            className="border-b border-b-neutral-200"
            showAll={showHideAllEnvironmentVariablesValues}
            currentScope={scope}
            parentId={applicationId}
            onCreateVariable={(variable, variableType) => {
              openModal({
                content: (
                  <CreateUpdateVariableModal
                    closeModal={closeModal}
                    variable={variable}
                    type={variableType}
                    mode="CREATE"
                    serviceId={applicationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    scope={scope}
                  />
                ),
              })
            }}
            onEditVariable={(variable) => {
              openModal({
                content: (
                  <CreateUpdateVariableModal
                    closeModal={closeModal}
                    variable={variable}
                    mode="UPDATE"
                    serviceId={applicationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    type={variable.variable_type}
                    scope={scope}
                  />
                ),
              })
            }}
            onDeleteVariable={(variable) => {
              openModalConfirmation({
                title: 'Delete variable',
                name: variable.key,
                isDelete: true,
                action: async () => {
                  await deleteVariable({ variableId: variable.id })
                  let name = variable.key
                  if (name && name.length > 30) {
                    name = name.substring(0, 30) + '...'
                  }
                  const toasterCallback = () => actionRedeployEnvironment({ environmentId })
                  toast(
                    ToastEnum.SUCCESS,
                    'Deletion success',
                    `${name} has been deleted. You need to redeploy your environment for your changes to be applied.`,
                    toasterCallback,
                    undefined,
                    'Redeploy'
                  )
                },
              })
            }}
          />
        )}
      </div>
    </div>
  )
}

export default PageVariablesFeature
