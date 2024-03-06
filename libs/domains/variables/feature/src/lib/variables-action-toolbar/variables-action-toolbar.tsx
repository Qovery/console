import { ActionToolbar, DropdownMenu, Icon, Tooltip } from '@qovery/shared/ui'

export interface VariablesActionToolbarProps {
  onImportEnvFile: () => void
  onCreateVariable: () => void
  onCreateVariableFile: () => void
}

export function VariablesActionToolbar({
  onImportEnvFile,
  onCreateVariable,
  onCreateVariableFile,
}: VariablesActionToolbarProps) {
  return (
    <ActionToolbar.Root className="flex">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <ActionToolbar.Button color="brand" variant="solid" className="justify-center border-r border-brand-400">
            <Icon iconName="ellipsis-v" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={onImportEnvFile} icon={<Icon iconName="cloud-upload" />}>
            Import from .env file
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild icon={<Icon iconName="rotate" />}>
            <a href="https://dashboard.doppler.com" target="_blank" rel="noopener noreferrer">
              Import from Doppler
              <Tooltip content="Documentation">
                <a
                  className="text-sm ml-auto"
                  href="https://hub.qovery.com/docs/using-qovery/integration/secret-manager/doppler/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon iconName="circle-info" className="text-neutral-400" />
                </a>
              </Tooltip>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <ActionToolbar.Button color="brand" variant="solid" className="gap-2">
            <span className="text-xs">New variable</span>
            <Icon iconName="circle-plus" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={onCreateVariable} icon={<Icon iconName="feather" />}>
            Variable
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={onCreateVariableFile} icon={<Icon iconName="file-lines" />}>
            Variable as file
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ActionToolbar.Root>
  )
}

export default VariablesActionToolbar
