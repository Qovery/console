import { type ProjectCost, type ServiceResources } from '@qovery/domains/cost-management/data-access'
import { evaluateCostPolicy } from './evaluate-cost-policy'

const BUDGET = 50

function buildProjectCost(forecast: number): ProjectCost {
  return {
    projectId: 'project-1',
    policy: {
      name: 'Internal Apps — Standard',
      monthlyLimit: BUDGET,
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

/** 250 mCPU + 512 MiB — $3.80 per instance per month with the prototype rates. */
function backend(instances: number, overrides: Partial<ServiceResources> = {}): ServiceResources {
  return { cpuMilli: 250, ramMib: 512, instances, ...overrides }
}

describe('evaluateCostPolicy', () => {
  it('allows a scale-up that fits within the budget', () => {
    const result = evaluateCostPolicy(buildProjectCost(39.43), {
      type: 'scale_service',
      serviceName: 'backend',
      before: backend(2),
      after: backend(4),
    })

    expect(result.allowed).toBe(true)
    expect(result.monthlyDelta).toBeCloseTo(7.6)
    expect(result.projectedForecast).toBeCloseTo(47.03)
  })

  it('denies a scale-up that would push the forecast over the budget', () => {
    const result = evaluateCostPolicy(buildProjectCost(39.43), {
      type: 'scale_service',
      serviceName: 'backend',
      before: backend(2),
      after: backend(8),
    })

    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('project_monthly_budget_exceeded')
    expect(result.projectedForecast).toBeCloseTo(62.23)
  })

  it('reports the largest instance count that still fits when denying a scale-up', () => {
    const result = evaluateCostPolicy(buildProjectCost(39.43), {
      type: 'scale_service',
      serviceName: 'backend',
      before: backend(2),
      after: backend(8),
    })

    expect(result.maxAllowedInstances).toBe(4)
  })

  it('denies adding a GPU that dwarfs the budget', () => {
    const result = evaluateCostPolicy(buildProjectCost(39.43), {
      type: 'scale_service',
      serviceName: 'image-worker',
      before: backend(1),
      after: backend(1, { gpu: 1 }),
    })

    expect(result.allowed).toBe(false)
    expect(result.monthlyDelta).toBeCloseTo(340)
  })

  it('allows a scale-down even when the project is already over budget', () => {
    const result = evaluateCostPolicy(buildProjectCost(58), {
      type: 'scale_service',
      serviceName: 'backend',
      before: backend(8),
      after: backend(2),
    })

    expect(result.allowed).toBe(true)
    expect(result.monthlyDelta).toBeLessThan(0)
  })

  it('allows deploying an environment while the project is within budget', () => {
    const result = evaluateCostPolicy(buildProjectCost(39.43), {
      type: 'deploy_environment',
      environmentName: 'dev',
      resources: [backend(2), backend(1, { managedDatabases: 1 })],
    })

    expect(result.allowed).toBe(true)
    expect(result.operationMonthlyCost).toBeCloseTo(26.4)
  })

  it('denies deploying an environment once the budget is exhausted', () => {
    const result = evaluateCostPolicy(buildProjectCost(BUDGET), {
      type: 'deploy_environment',
      environmentName: 'dev',
      resources: [backend(1)],
    })

    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('project_monthly_budget_exhausted')
  })
})
