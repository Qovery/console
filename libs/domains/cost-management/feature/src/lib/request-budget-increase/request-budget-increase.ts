import { toast } from '@qovery/shared/ui'

/**
 * PROTOTYPE stub for the budget increase workflow.
 *
 * The real flow would open a request, notify the platform team and write an
 * audit event. Stubbed here so the denial screen never dead-ends in a demo.
 */
export function requestBudgetIncrease(projectName?: string) {
  toast(
    'warning',
    'Prototype — no request was sent',
    `A budget increase${projectName ? ` for ${projectName}` : ''} would reach the approver here. The request and approval flow is not built yet.`
  )
}
