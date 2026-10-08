import { toast } from '@qovery/shared/ui'

/**
 * PROTOTYPE stub for the budget increase workflow.
 *
 * The real flow would open a request, notify the platform team and write an
 * audit event. Stubbed here so the denial screen never dead-ends in a demo.
 */
export function requestBudgetIncrease(projectName?: string) {
  toast(
    'success',
    'Budget increase requested',
    `The platform team has been notified${projectName ? ` about ${projectName}` : ''}. You will be notified once it is reviewed.`
  )
}
