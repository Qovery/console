import { useParams } from '@tanstack/react-router'
import {
  CreateUpdateVariableModal,
  ImportEnvironmentVariableModalFeature,
  VariableList,
  VariablesActionToolbar,
  useVariables,
} from '@qovery/domains/variables/feature'
import { Button, DropdownMenu, EmptyState, Icon, toast, useModal } from '@qovery/shared/ui'
import { useService } from '../hooks/use-service/use-service'
import { getServiceVariableScope } from './service-variables-utils'
import { useServiceVariablesTab } from './use-service-variables-tab'

export function CustomTab() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { redeployServiceAction, hasClusterSecretManagerConfigured } = useServiceVariablesTab()
  const scope = getServiceVariableScope(service?.serviceType)
  const { openModal, closeModal } = useModal()
  const { data: variables = [], isLoading: isVariablesLoading } = useVariables({
    parentId: serviceId,
    scope,
  })
  const customVariables = variables.filter(
    (variable) => variable.scope !== 'BUILT_IN' && variable.variable_type !== 'EXTERNAL_SECRET'
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

  const handleOpenCreateVariableModal = (isFile = false) =>
    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          type="VALUE"
          mode="CREATE"
          onSubmit={onCreateVariableToast}
          isFile={isFile}
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
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button color="neutral" variant="solid" size="md" className="gap-1.5">
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add variable
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => handleOpenCreateVariableModal()} icon={<Icon iconName="key" />}>
                  Variable
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => handleOpenCreateVariableModal(true)}
                  icon={<Icon iconName="file-lines" iconStyle="regular" />}
                >
                  Variable as file
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

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
                <DropdownMenu.Item
                  onSelect={() => window.open('https://dashboard.doppler.com', '_blank')}
                  icon={<Icon iconName="arrow-up-right-from-square" />}
                >
                  Import from Doppler
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
        let name = variable.key
        if (name && name.length > 30) {
          name = name.substring(0, 30) + '...'
        }
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
