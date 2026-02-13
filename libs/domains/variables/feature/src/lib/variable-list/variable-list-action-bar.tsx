import { StickyActionFormToaster, useModalConfirmation } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { type useVariables } from '../hooks/use-variables/use-variables'

export interface VariableListActionBarProps {
  selectedRows: ReturnType<typeof useVariables>['data']
  resetRowSelection: () => void
}

export function VariableListActionBar({ selectedRows = [], resetRowSelection }: VariableListActionBarProps) {
  const selectedCount = selectedRows.length
  const hasSelection = Boolean(selectedCount)

  const { mutateAsync: deleteVariable } = useDeleteVariable()

  const { openModalConfirmation } = useModalConfirmation()

  const deletableVariables = selectedRows.filter(({ scope }) => scope !== 'BUILT_IN')
  const deletableCount = deletableVariables.length
  const description =
    selectedCount === 0
      ? ''
      : `${selectedCount} selected ${pluralize(selectedCount, 'variable')}${
          deletableCount === selectedCount ? '' : ` (${deletableCount} deletable)`
        }`

  const handleDeleteAllVariables = () =>
    openModalConfirmation({
      title: `Delete ${deletableCount} ${pluralize(deletableCount, 'variable')}`,
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
    <StickyActionFormToaster
      visible={hasSelection}
      description={description}
      onReset={resetRowSelection}
      submitButtonColor="red"
      resetLabel="Deselect"
      onSubmit={handleDeleteAllVariables}
      submitLabel="Delete selected"
      disabledValidation={deletableCount === 0}
    />
  )
}
