import { useCallback } from 'react'
import { type CostOperation } from '@qovery/domains/cost-management/data-access'
import { useModal } from '@qovery/shared/ui'
import { CostPolicyCheckModal } from '../../cost-policy-check-modal/cost-policy-check-modal'
import { evaluateCostPolicy } from '../../utils/evaluate-cost-policy'
import useApplyCostDelta from '../use-apply-cost-delta/use-apply-cost-delta'
import useProjectCost from '../use-project-cost/use-project-cost'

export interface UseCostPolicyCheckProps {
  projectId: string
  projectName?: string
}

/**
 * Gates an operation behind the project's budget policy.
 *
 * The same check backs every entry point — a scale-up from the resources form
 * and a deploy from the environment toolbar go through one evaluation and one
 * screen, so the boundary is the platform's, not each caller's.
 */
export function useCostPolicyCheck({ projectId, projectName }: UseCostPolicyCheckProps) {
  const { data: cost } = useProjectCost({ projectId })
  const { openModal } = useModal()
  const applyCostDelta = useApplyCostDelta()

  const checkCostPolicy = useCallback(
    (operation: CostOperation, onAllowed: () => void) => {
      if (!cost) {
        onAllowed()
        return
      }

      const evaluation = evaluateCostPolicy(cost, operation)

      // Nothing to weigh up: a change with no cost impact goes straight through
      // rather than putting a confirmation in the way of a routine edit.
      if (evaluation.allowed && evaluation.monthlyDelta === 0 && operation.type === 'scale_service') {
        onAllowed()
        return
      }

      openModal({
        content: (
          <CostPolicyCheckModal
            operation={operation}
            evaluation={evaluation}
            projectName={projectName}
            onConfirm={() => {
              applyCostDelta(projectId, evaluation.monthlyDelta)
              onAllowed()
            }}
          />
        ),
        options: { width: 520, fakeModal: true },
      })
    },
    [cost, openModal, applyCostDelta, projectId, projectName]
  )

  return { checkCostPolicy }
}

export default useCostPolicyCheck
