import { type APIVariableScopeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { ActionToolbar, DropdownMenu, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import { CreateUpdateVariableModal } from '../create-update-variable-modal/create-update-variable-modal'

type Scope = Exclude<keyof typeof APIVariableScopeEnum, 'BUILT_IN'>

export type VariablesActionToolbarProps = {
  onCreateVariable?: (variable: VariableResponse | void) => void
  onImportEnvFile?: () => void
} & (
  | {
      scope: Extract<Scope, 'PROJECT'>
      projectId: string
    }
  | {
      scope: Extract<Scope, 'ENVIRONMENT'>
      projectId: string
      environmentId: string
    }
  | {
      scope: Exclude<Scope, 'PROJECT' | 'ENVIRONMENT'>
      projectId: string
      environmentId: string
      serviceId: string
    }
)

export function VariablesActionToolbar({ onCreateVariable, onImportEnvFile, ...props }: VariablesActionToolbarProps) {
  const { openModal, closeModal } = useModal()

  const _onCreateVariable = (isFile?: boolean) =>
    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          type="VALUE"
          mode="CREATE"
          onSubmit={onCreateVariable}
          isFile={isFile}
          {...props}
        />
      ),
    })

  return (
    <ActionToolbar.Root className="flex">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <ActionToolbar.Button color="brand" variant="solid" className="justify-center border-r border-brand-400">
            <Icon iconName="ellipsis-v" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {onImportEnvFile && (
            <DropdownMenu.Item onSelect={onImportEnvFile} icon={<Icon iconName="cloud-upload" />}>
              Import from .env file
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item asChild icon={<Icon iconName="rotate" />}>
            <a href="https://dashboard.doppler.com" target="_blank" rel="noopener noreferrer">
              Import from Doppler
              <Tooltip content="Documentation">
                <a
                  className="ml-auto text-sm"
                  href="https://hub.qovery.com/docs/using-qovery/integration/secret-manager/doppler/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-400" />
                </a>
              </Tooltip>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <ActionToolbar.Button color="brand" variant="solid" size="md" className="gap-2">
            New variable
            <Icon iconName="circle-plus" iconStyle="regular" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => _onCreateVariable()} icon={<Icon iconName="key" />}>
            Variable
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => _onCreateVariable(true)}
            icon={<Icon iconName="file-lines" iconStyle="regular" />}
          >
            Variable as file
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ActionToolbar.Root>
  )
}

export default VariablesActionToolbar
