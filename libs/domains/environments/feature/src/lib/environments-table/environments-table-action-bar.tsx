import { type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { Button, DropdownMenu, Icon, Tooltip, useModalConfirmation } from '@qovery/shared/ui'
import { isStopAvailable, pluralize, twMerge } from '@qovery/shared/util-js'
import { useStopEnvironment } from '../hooks/use-stop-environment/use-stop-environment'

export interface EnvironmentsTableActionBarProps {
  projectId: string
  selectedRows: EnvironmentOverviewResponse[]
  resetRowSelection: () => void
}

export function EnvironmentsTableActionBar({
  projectId,
  selectedRows,
  resetRowSelection,
}: EnvironmentsTableActionBarProps) {
  const hasSelection = Boolean(selectedRows.length)
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: stopEnvironment } = useStopEnvironment({ projectId })

  const stoppableEnvironments = selectedRows.filter(
    ({ deployment_status }) =>
      deployment_status?.last_deployment_state && isStopAvailable(deployment_status.last_deployment_state)
  )

  const unstoppableEnvironments = selectedRows.filter(
    ({ id: selectedId }) => !stoppableEnvironments.find(({ id }) => id === selectedId)
  )

  const handleStopEnvironments = () => {
    const count = stoppableEnvironments.length

    openModalConfirmation({
      title: 'Confirm stop',
      description: (
        <span>
          You are going to stop {count} {pluralize(count, 'environment')}. To confirm, please type "stop".
        </span>
      ),
      warning: unstoppableEnvironments.length ? (
        <>
          <span className="font-medium text-neutral">Some environments will not be impacted:</span>
          <ul className="mt-1 list-disc pl-4">
            {unstoppableEnvironments.map(({ id, name }) => (
              <li key={id}>{name}</li>
            ))}
          </ul>
        </>
      ) : null,
      confirmationMethod: 'action',
      confirmationAction: 'stop',
      action: async () => {
        await Promise.all(stoppableEnvironments.map(({ id }) => stopEnvironment({ environmentId: id })))
        resetRowSelection()
      },
    })
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-overlay flex justify-center px-4">
      <div
        className={twMerge(
          'w-full max-w-[500px]',
          hasSelection ? 'pointer-events-auto' : 'pointer-events-none h-0 overflow-hidden'
        )}
      >
        <div
          className={twMerge(
            'flex items-center justify-between rounded-md border border-neutral bg-surface-neutralInvert-component p-2 pl-4 text-sm font-medium text-neutralInvert shadow-xl',
            hasSelection ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
          )}
        >
          <span className="truncate">
            {selectedRows.length} selected {pluralize(selectedRows.length, 'environment')}
          </span>
          <button className="h-8 px-3 underline" type="button" onClick={resetRowSelection}>
            Deselect
          </button>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <Button color="neutral" size="md" variant="surface" className="items-center">
                More <Icon iconName="angle-down" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <Tooltip content="No stoppable environments" disabled={stoppableEnvironments.length !== 0}>
                <DropdownMenu.Item
                  icon={<Icon iconName="circle-stop" />}
                  onSelect={handleStopEnvironments}
                  disabled={stoppableEnvironments.length === 0}
                >
                  Stop selected
                </DropdownMenu.Item>
              </Tooltip>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentsTableActionBar
