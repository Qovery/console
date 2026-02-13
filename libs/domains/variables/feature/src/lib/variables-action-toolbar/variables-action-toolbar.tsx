import { type APIVariableScopeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { ActionToolbar, Button, DropdownMenu, Icon, Tooltip, useModal } from '@qovery/shared/ui'
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
      options: {
        fakeModal: true,
      },
    })

  return (
    <div className="flex gap-3">
      <DropdownMenu.Root>
        {onImportEnvFile ? (
          <DropdownMenu.Trigger asChild>
            <Button color="neutral" variant="outline" size="md" className="gap-2">
              <Icon iconName="arrow-up-from-line" iconStyle="regular" />
              Import variable
            </Button>
          </DropdownMenu.Trigger>
        ) : (
          <DropdownMenu.Trigger asChild>
            <Button color="neutral" variant="outline" size="md" className="flex w-8 justify-center">
              <Icon iconName="ellipsis-vertical" iconStyle="regular" />
            </Button>
          </DropdownMenu.Trigger>
        )}
        <DropdownMenu.Content>
          {onImportEnvFile && (
            <DropdownMenu.Item onSelect={onImportEnvFile} icon={<Icon iconName="file-import" />}>
              Import from .env file
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item asChild icon={<Icon iconName="circle-info" iconStyle="regular" />}>
            <a href="https://dashboard.doppler.com" target="_blank" rel="noopener noreferrer">
              Import from Doppler
              <Tooltip content="Documentation">
                <a
                  className="ml-auto text-sm"
                  href="https://www.qovery.com/docs/configuration/integrations/secret-managers/doppler#doppler"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                </a>
              </Tooltip>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button color="brand" variant="solid" size="md" className="gap-2">
            <Icon iconName="circle-plus" iconStyle="regular" />
            New variable
          </Button>
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
    </div>
  )
}

export default VariablesActionToolbar
