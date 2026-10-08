import { type ApprovalChannel, type BudgetPolicy } from '@qovery/domains/cost-management/data-access'
import { BlockContent, Button, Icon, InputSelect, useModal } from '@qovery/shared/ui'
import useBudgetSettings from '../hooks/use-budget-settings/use-budget-settings'
import { SetBudgetModal } from '../set-budget-modal/set-budget-modal'
import { formatCost } from '../utils/format-cost'

export interface BudgetPolicyCardProps {
  policy: BudgetPolicy
  /** Number of projects currently running on this default. */
  inheritingProjects: number
}

const APPROVER_OPTIONS = [
  { label: 'Platform Engineering', value: 'Platform Engineering' },
  { label: 'Project owner', value: 'Project owner' },
  { label: 'Finance', value: 'Finance' },
]

const CHANNEL_OPTIONS: { label: string; value: ApprovalChannel }[] = [
  { label: 'Slack', value: 'slack' },
  { label: 'Email', value: 'email' },
]

/**
 * The organization default every new project inherits.
 *
 * Editing it here is what keeps the model workable at scale: a platform team
 * sets the operating model once instead of configuring a budget per project.
 */
export function BudgetPolicyCard({ policy, inheritingProjects }: BudgetPolicyCardProps) {
  const { updateDefaultPolicy } = useBudgetSettings()
  const { openModal } = useModal()

  const openLimitModal = () =>
    openModal({
      content: (
        <SetBudgetModal
          title="Default monthly budget"
          description="Applied to every project that does not have a budget of its own."
          currentLimit={policy.monthlyLimit}
          onSubmit={(monthlyLimit) => updateDefaultPolicy({ monthlyLimit })}
        />
      ),
      options: { width: 480, fakeModal: true },
    })

  return (
    <BlockContent
      title="Default budget policy"
      headRight={
        <span className="text-xs text-neutral-subtle">
          {policy.name} · applied to {inheritingProjects} {inheritingProjects === 1 ? 'project' : 'projects'}
        </span>
      }
      classNameContent="p-0"
    >
      <div className="flex items-center justify-between border-b border-neutral px-4 py-3">
        <div>
          <p className="text-sm text-neutral">Monthly limit</p>
          <p className="text-xs text-neutral-subtle">Inherited by every new project.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-neutral">{formatCost(policy.monthlyLimit, policy.currency)}</span>
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={openLimitModal}>
            Edit
          </Button>
        </div>
      </div>

      <ul className="border-b border-neutral">
        {policy.thresholds.map((threshold) => (
          <li key={threshold.percent} className="flex items-start gap-3 px-4 py-2.5">
            <span className="w-10 shrink-0 font-mono text-sm text-neutral">{threshold.percent}%</span>
            <span className="text-sm text-neutral-subtle">{threshold.action}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-4 px-4 py-3">
        <InputSelect
          label="Budget requests approved by"
          value={policy.approver}
          options={APPROVER_OPTIONS}
          onChange={(value) => updateDefaultPolicy({ approver: value as string })}
        />
        <InputSelect
          label="Notified through"
          value={policy.approvalChannel}
          options={CHANNEL_OPTIONS}
          onChange={(value) => updateDefaultPolicy({ approvalChannel: value as ApprovalChannel })}
        />
      </div>

      <p className="flex items-start gap-2 px-4 pb-3 text-xs text-neutral-subtle">
        <Icon iconName="circle-info" iconStyle="regular" className="mt-0.5" />
        When a project owner requests more budget, {policy.approver} is notified on{' '}
        {policy.approvalChannel === 'slack' ? 'Slack' : 'email'} and approves or declines it.
      </p>
    </BlockContent>
  )
}

export default BudgetPolicyCard
