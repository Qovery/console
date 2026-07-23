import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  CreateUpdateVariableModal,
  ImportEnvironmentVariableModalFeature,
  VariableList,
  VariablesActionToolbar,
  useVariables,
  useVariablesSecretManagers,
} from '@qovery/domains/variables/feature'
import { isExternalSecretVariable } from '@qovery/domains/variables/util'
import { Button, DropdownMenu, EmptyState, Icon, toast, truncateText, useModal } from '@qovery/shared/ui'
import { useRedeployServiceAction } from '../hooks/use-redeploy-service-action/use-redeploy-service-action'
import { useService } from '../hooks/use-service/use-service'
import { getServiceVariableScope } from './service-variables-utils'

export function ServiceVariablesCustomTab() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { hasClusterSecretManagerConfigured } = useVariablesSecretManagers()
  const redeployServiceAction = useRedeployServiceAction(service?.serviceType)
  const scope = getServiceVariableScope(service?.serviceType)
  const { openModal, closeModal } = useModal()
  const { data: variables = [], isLoading: isVariablesLoading } = useVariables({
    parentId: serviceId,
    scope,
  })
  const customVariables = variables.filter(
    (variable) => variable.scope !== 'BUILT_IN' && !isExternalSecretVariable(variable)
  )

  const onCreateVariableToast = () =>
    toast(
      'success',
      'Creation success',
      'You need to redeploy your service for your changes to be applied.',
      redeployServiceAction,
      'Redeploy'
    )

  if (!scope) {
    return null
  }

  const handleOpenCreateVariableModal = ({
    isFile = false,
    isSecret = false,
  }: {
    isFile?: boolean
    isSecret?: boolean
  } = {}) =>
    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          type="VALUE"
          mode="CREATE"
          onSubmit={onCreateVariableToast}
          isFile={isFile}
          isSecret={isSecret}
          hasClusterSecretManagerConfigured={hasClusterSecretManagerConfigured}
          scope={scope}
          projectId={projectId}
          environmentId={environmentId}
          serviceId={serviceId}
        />
      ),
      options: {
        fakeModal: true,
      },
    })

  const handleOpenImportVariablesModal = () =>
    openModal({
      content: (
        <ImportEnvironmentVariableModalFeature
          scope={scope}
          projectId={projectId}
          environmentId={environmentId}
          closeModal={closeModal}
          serviceId={serviceId}
        />
      ),
      options: {
        width: 750,
      },
    })

  if (!isVariablesLoading && customVariables.length === 0) {
    return (
      <div className="bg-background">
        <EmptyState
          title="No custom variables added yet"
          description="Add environment variables to configure your service at build or runtime."
          icon="wave-pulse"
          className="rounded-none border-0 bg-transparent py-12"
        >
          <div className="flex items-center gap-2">
            <Button color="neutral" variant="solid" size="md" onClick={() => handleOpenCreateVariableModal()}>
              <Icon iconName="key" />
              Add variable
            </Button>

            <Button
              color="neutral"
              variant="outline"
              size="md"
              onClick={() => handleOpenCreateVariableModal({ isSecret: true })}
            >
              <Icon iconName="lock-keyhole" iconStyle="regular" />
              Add secret
            </Button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button color="neutral" variant="outline" size="md" className="gap-1.5">
                  <Icon iconName="file-import" iconStyle="regular" />
                  Import variables
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={handleOpenImportVariablesModal} icon={<Icon iconName="file-import" />}>
                  Import from .env file
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </EmptyState>
      </div>
    )
  }

  return (
    <VariableList
      showOnly="custom"
      hideSectionLabel
      headerActions={
        <VariablesActionToolbar
          showDopplerButton
          scope={scope}
          projectId={projectId}
          environmentId={environmentId}
          serviceId={serviceId}
          onCreateVariable={onCreateVariableToast}
          onImportEnvFile={handleOpenImportVariablesModal}
          importEnvFileAccess="dropdown"
          hasClusterSecretManagerConfigured={hasClusterSecretManagerConfigured}
        />
      }
      scope={scope}
      serviceId={serviceId}
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      onCreateVariable={onCreateVariableToast}
      onEditVariable={() => {
        toast(
          'success',
          'Edition success',
          'You need to redeploy your service for your changes to be applied.',
          redeployServiceAction,
          'Redeploy'
        )
      }}
      onDeleteVariable={(variable) => {
        const name = `${truncateText(variable.key, 30)}${variable.key.length > 30 ? '...' : ''}`
        toast(
          'success',
          'Deletion success',
          `${name} has been deleted. You need to redeploy your service for your changes to be applied.`,
          redeployServiceAction,
          'Redeploy'
        )
      }}
    />
  )
}
