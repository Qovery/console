import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { Button, Icon, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useDeleteAlertRule } from '../../../hooks/use-delete-alert-rule/use-delete-alert-rule'
import { AlertRulesCloneModal } from '../../alert-rules-clone-modal/alert-rules-clone-modal'

export interface AlertRulesActionBarProps {
  selectedAlertRules: AlertRuleResponse[]
  resetRowSelection: () => void
  organizationId: string
}

export function AlertRulesActionBar({
  selectedAlertRules,
  resetRowSelection,
  organizationId,
}: AlertRulesActionBarProps) {
  const hasSelection = Boolean(selectedAlertRules.length)
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deleteAlertRule } = useDeleteAlertRule({ organizationId })

  const deletableAlertRules = selectedAlertRules.filter((alertRule) => alertRule.source === 'MANAGED')

  const handleDeleteAllAlertRules = () =>
    openModalConfirmation({
      title: `Delete ${deletableAlertRules.length} ${pluralize(deletableAlertRules.length, 'alert rule')}`,
      description: 'To confirm the deletion of your alert rules, please type:',
      confirmationMethod: 'action',
      confirmationAction: 'delete',
      name: 'these alert rules',
      action: async () => {
        try {
          await Promise.allSettled(
            deletableAlertRules.map((alertRule) => deleteAlertRule({ alertRuleId: alertRule.id }))
          )
          resetRowSelection()
        } catch (error) {
          console.error(error)
        }
      },
    })

  const handleCloneAlertRules = () => {
    if (selectedAlertRules.length === 0) return

    openModal({
      content: (
        <AlertRulesCloneModal
          alertRules={selectedAlertRules}
          organizationId={organizationId}
          onClose={() => {
            closeModal()
            resetRowSelection()
          }}
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

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
              'flex h-14 items-center justify-between rounded border border-neutral-200 bg-neutral-50 pl-4 pr-3 text-sm font-medium text-neutral-400 shadow-xl',
              hasSelection ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
            )}
          >
            <span>
              {selectedAlertRules.length} selected {pluralize(selectedAlertRules.length, 'alert')}
            </span>
            <div className="flex items-center gap-2">
              <button className="px-2 text-ssm underline" type="button" onClick={() => resetRowSelection()}>
                Unselect
              </button>
              <div className="flex gap-3">
                <Button size="md" variant="outline" className="items-center gap-2" onClick={handleCloneAlertRules}>
                  <Icon iconName="clone" />
                  Clone
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  className="items-center gap-2 text-red-500"
                  onClick={handleDeleteAllAlertRules}
                  disabled={deletableAlertRules.length === 0}
                >
                  <Icon iconName="trash-can" iconStyle="regular" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
