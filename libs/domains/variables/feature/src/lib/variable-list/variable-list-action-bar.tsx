import { Button, Icon, Tooltip, useModalConfirmation } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { type useVariables } from '../hooks/use-variables/use-variables'

export interface VariableListActionBarProps {
  selectedRows: ReturnType<typeof useVariables>['data']
  resetRowSelection: () => void
}

export function VariableListActionBar({ selectedRows = [], resetRowSelection }: VariableListActionBarProps) {
  const hasSelection = Boolean(selectedRows.length)

  const { mutateAsync: deleteVariable } = useDeleteVariable()

  const { openModalConfirmation } = useModalConfirmation()

  const deletableVariables = selectedRows.filter(({ scope }) => scope !== 'BUILT_IN')

  const handleDeleteAllVariables = () =>
    openModalConfirmation({
      title: `Delete ${deletableVariables.length} ${pluralize(deletableVariables.length, 'variable')}`,
      name: 'these variables',
      confirmationMethod: 'action',
      action: async () => {
        try {
          await Promise.allSettled(deletableVariables.map(({ id }) => deleteVariable({ variableId: id })))
          resetRowSelection()
        } catch (error) {
          console.error(error)
        }
      },
    })

  return (
    <div className="sticky bottom-4">
      <div className="relative">
        <div
          className={twMerge(
            'absolute bottom-4 left-1/2 w-[448px] -translate-x-1/2',
            hasSelection ? '' : 'h-0 overflow-hidden'
          )}
        >
          <div
            className={twMerge(
              'flex h-[52px] items-center justify-between rounded-md border border-neutral bg-surface-neutralInvert-component p-2 pl-4 text-sm font-medium text-neutralInvert shadow-xl',
              hasSelection ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
            )}
          >
            <span>
              {selectedRows.length} selected {pluralize(selectedRows.length, 'variable')}
            </span>
            <div className="flex gap-3">
              <Button type="button" variant="surface" color="neutral" size="md" onClick={() => resetRowSelection()}>
                Deselect
              </Button>
              <Tooltip content="No deletable variables" disabled={deletableVariables.length !== 0}>
                <Button
                  color="red"
                  size="md"
                  className="items-center gap-2"
                  onClick={() => handleDeleteAllVariables()}
                  disabled={deletableVariables.length === 0}
                >
                  Delete selected <Icon iconName="trash" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
