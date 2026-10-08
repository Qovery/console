import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import { budgetEnforcement } from './budget-enforcement'

function buildProjectCost(forecast: number, monthlyLimit = 50): ProjectCost {
  return {
    projectId: 'project-1',
    policy: {
      name: 'Internal Apps — Standard',
      monthlyLimit,
      currency: 'USD',
      thresholds: [],
      approver: 'Platform Engineering',
      approvalChannel: 'slack',
    },
    budgetSource: 'inherited',
    estimatedSpend: forecast / 2,
    reconciledSpend: forecast / 2,
    reconciledAt: new Date().toISOString(),
    forecast,
    resetsOn: new Date().toISOString(),
    environments: [],
  }
}

describe('budgetEnforcement', () => {
  it('does nothing below the first threshold', () => {
    expect(budgetEnforcement(buildProjectCost(30))).toBe('none')
  })

  it('notifies the owner from 70%', () => {
    expect(budgetEnforcement(buildProjectCost(35))).toBe('owner_notified')
  })

  it('blocks scale-up from 90%', () => {
    expect(budgetEnforcement(buildProjectCost(45))).toBe('scale_up_blocked')
  })

  it('blocks new resources once the budget is spent', () => {
    expect(budgetEnforcement(buildProjectCost(58))).toBe('new_resources_blocked')
  })

  it('follows the project budget rather than the organization default', () => {
    expect(budgetEnforcement(buildProjectCost(58, 200))).toBe('none')
  })
})
