import { match } from 'ts-pattern'
import { type CostOperation, type PolicyEvaluation } from '@qovery/domains/cost-management/data-access'
import { Button, Callout, DescriptionList, Icon, useModal } from '@qovery/shared/ui'
import { requestBudgetIncrease } from '../request-budget-increase/request-budget-increase'
import { formatCost, formatCostDelta } from '../utils/format-cost'

export interface CostPolicyCheckModalProps {
  operation: CostOperation
  evaluation: PolicyEvaluation
  projectName?: string
  /** Runs the operation the check was gating. Only reachable when allowed. */
  onConfirm: () => void
}

function describeOperation(operation: CostOperation): string {
  return match(operation)
    .with({ type: 'scale_service' }, ({ serviceName, before, after }) =>
      before.instances !== after.instances
        ? `Scale ${serviceName} from ${before.instances} to ${after.instances} instances`
        : `Change the resources of ${serviceName}`
    )
    .with({ type: 'deploy_environment' }, ({ environmentName }) => `Deploy ${environmentName}`)
    .exhaustive()
}

export function CostPolicyCheckModal({ operation, evaluation, projectName, onConfirm }: CostPolicyCheckModalProps) {
  const { closeModal } = useModal()
  const { allowed, budget, currency, currentForecast, projectedForecast, monthlyDelta, operationMonthlyCost } =
    evaluation

  const confirmLabel = operation.type === 'deploy_environment' ? 'Deploy' : 'Apply change'

  const consumedPercent = Math.round((projectedForecast / budget) * 100)

  const handleConfirm = () => {
    onConfirm()
    closeModal()
  }

  const handleRequestBudget = () => {
    requestBudgetIncrease(projectName)
    closeModal()
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-1 text-neutral">Budget policy check</h2>
      <p className="mb-6 text-sm text-neutral-subtle">{describeOperation(operation)}</p>

      <DescriptionList.Root className="mb-6 gap-y-3 text-sm">
        {operation.type === 'deploy_environment' && (
          <>
            <DescriptionList.Term>Environment run rate</DescriptionList.Term>
            <DescriptionList.Details className="text-right font-mono">
              {formatCost(operationMonthlyCost, currency)} / month
            </DescriptionList.Details>
          </>
        )}

        <DescriptionList.Term>Monthly impact</DescriptionList.Term>
        <DescriptionList.Details className="text-right font-mono">
          {monthlyDelta === 0 ? 'No change' : formatCostDelta(monthlyDelta, currency)}
        </DescriptionList.Details>

        <DescriptionList.Term>Project forecast</DescriptionList.Term>
        <DescriptionList.Details className="text-right font-mono">
          {monthlyDelta === 0 ? (
            formatCost(currentForecast, currency)
          ) : (
            <>
              <span className="text-neutral-subtle">{formatCost(currentForecast, currency)}</span>
              <Icon iconName="arrow-right" className="mx-1.5 text-xs text-neutral-subtle" />
              {formatCost(projectedForecast, currency)}
            </>
          )}
        </DescriptionList.Details>

        <DescriptionList.Term>Project budget</DescriptionList.Term>
        <DescriptionList.Details className="text-right font-mono">
          {formatCost(budget, currency)}
        </DescriptionList.Details>
      </DescriptionList.Root>

      {allowed ? (
        <Callout.Root color="green">
          <Callout.Icon>
            <Icon iconName="circle-check" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Allowed</Callout.TextHeading>
            <Callout.TextDescription>
              The project stays within its budget, at {consumedPercent}% after this change.
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      ) : (
        <Callout.Root color="red">
          <Callout.Icon>
            <Icon iconName="circle-xmark" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Denied</Callout.TextHeading>
            <Callout.TextDescription>
              {match(evaluation.reason)
                .with('project_monthly_budget_exceeded', () =>
                  evaluation.maxAllowedInstances !== undefined ? (
                    <>
                      This change would take the project over its monthly budget. The largest target that fits is{' '}
                      {evaluation.maxAllowedInstances} {evaluation.maxAllowedInstances === 1 ? 'instance' : 'instances'}
                      .
                    </>
                  ) : (
                    <>This change would take the project over its monthly budget.</>
                  )
                )
                .with('project_scale_up_frozen', () => (
                  <>
                    The project is at {Math.round((currentForecast / budget) * 100)}% of its monthly budget. Past 90%,
                    services cannot grow beyond their current size.
                  </>
                ))
                .otherwise(() => (
                  <>
                    The project has spent its monthly budget. No new resources can be created until the budget is raised
                    or the period resets.
                  </>
                ))}
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}

      <p className="mt-4 text-xs text-neutral-subtle">
        Enforced on the project's monthly run rate, not on the cloud provider's invoice.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="plain" color="neutral" size="lg" onClick={closeModal}>
          Cancel
        </Button>
        {allowed ? (
          <Button type="button" size="lg" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={handleRequestBudget}>
            Request more budget
          </Button>
        )}
      </div>
    </div>
  )
}

export default CostPolicyCheckModal
