import { type BudgetPolicy, type ProjectCost } from './types'

/**
 * PROTOTYPE — in-memory cost store.
 *
 * Stands in for the Cost API. State lives for the lifetime of the tab, which is
 * enough to demo a full scenario: accepting a scale-up raises the run rate and
 * the budget bar moves immediately.
 */

const INITIAL_POLICY: BudgetPolicy = {
  name: 'Internal Apps — Standard',
  monthlyLimit: 50,
  currency: 'USD',
  thresholds: [
    { percent: 70, action: 'Notify project owner' },
    { percent: 90, action: 'Notify owner and platform team, block scale-up beyond current size' },
    { percent: 100, action: 'Block new resources, suspend non-production environments' },
  ],
  approver: 'Platform Engineering',
  approvalChannel: 'slack',
}

function clonePolicy(policy: BudgetPolicy): BudgetPolicy {
  return { ...policy, thresholds: policy.thresholds.map((threshold) => ({ ...threshold })) }
}

/** The organization default. Mutated from the Cost control tab. */
let defaultPolicy: BudgetPolicy = clonePolicy(INITIAL_POLICY)

/** Per-project budget overrides. A project without one inherits the default. */
const budgetOverrides = new Map<string, number>()

/**
 * Run rate ranges a project is seeded into, in USD per month.
 *
 * `withinBudget` is deliberately narrow: any project in it can absorb a modest
 * scale-up but not a large one, which is the boundary the demo is about. Roughly
 * one project in `OVER_BUDGET_EVERY` lands in `overBudget` instead, so an
 * organization-wide view shows a believable spread rather than one repeated
 * figure.
 */
const RUN_RATE_RANGES = {
  withinBudget: { min: 31, max: 42 },
  overBudget: { min: 52, max: 64 },
} as const

const OVER_BUDGET_EVERY = 6

/** Share of the run rate attributed to each environment. */
const ENVIRONMENT_SHARES = [
  { environmentId: 'demo-dev', name: 'dev', namespace: 'z0a1b2c3-dev', share: 0.62 },
  { environmentId: 'demo-prod', name: 'production', namespace: 'z0a1b2c3-prod', share: 0.38 },
]

/**
 * Billing data lags behind reality, and spot pricing lands under the on-demand
 * estimate. Both are why the reconciled figure never matches the estimate.
 */
const RECONCILIATION_FACTOR = 0.93
const RECONCILIATION_LAG_HOURS = 18

/** Monthly run rate per project. Mutated as the demo progresses. */
const runRates = new Map<string, number>()

function elapsedMonthFraction(now = new Date()): number {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return now.getDate() / daysInMonth
}

function firstDayOfNextMonth(now = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}

/** Stable 32-bit hash, so a project keeps the same figures across reloads. */
function hashProjectId(projectId: string): number {
  let hash = 0

  for (let index = 0; index < projectId.length; index++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

/** Run rate a project starts at, before anything the demo does to it. */
function seedRunRate(projectId: string): number {
  const hash = hashProjectId(projectId)
  const { min, max } = hash % OVER_BUDGET_EVERY === 0 ? RUN_RATE_RANGES.overBudget : RUN_RATE_RANGES.withinBudget
  const spread = max - min

  return min + ((hash >> 3) % (spread * 100)) / 100
}

export function getRunRate(projectId: string): number {
  return runRates.get(projectId) ?? seedRunRate(projectId)
}

export function getProjectCost(projectId: string): ProjectCost {
  const now = new Date()
  const elapsed = elapsedMonthFraction(now)
  const runRate = getRunRate(projectId)
  const estimatedSpend = runRate * elapsed

  return {
    projectId,
    policy: { ...getDefaultBudgetPolicy(), monthlyLimit: getProjectBudget(projectId) },
    budgetSource: budgetOverrides.has(projectId) ? 'custom' : 'inherited',
    estimatedSpend,
    reconciledSpend: estimatedSpend * RECONCILIATION_FACTOR,
    reconciledAt: new Date(now.getTime() - RECONCILIATION_LAG_HOURS * 60 * 60 * 1000).toISOString(),
    // The forecast is the run rate: what the project costs over a full month if
    // nothing changes. Budget policy is enforced against this, not against the
    // month-to-date figure — otherwise an expensive change slipped in on the
    // 28th would always pass.
    forecast: runRate,
    resetsOn: firstDayOfNextMonth(now),
    environments: ENVIRONMENT_SHARES.map(({ share, ...environment }) => ({
      ...environment,
      estimatedSpend: estimatedSpend * share,
    })),
  }
}

/** Applies the monthly cost of an operation the user accepted. */
export function applyMonthlyDelta(projectId: string, delta: number): void {
  runRates.set(projectId, Math.max(0, getRunRate(projectId) + delta))
}

/** Demo control: puts the project at a given percentage of its budget. */
export function setBudgetConsumption(projectId: string, percent: number): void {
  runRates.set(projectId, (getProjectBudget(projectId) * percent) / 100)
}

/** The policy a project inherits when it has no budget of its own. */
export function getDefaultBudgetPolicy(): BudgetPolicy {
  return clonePolicy(defaultPolicy)
}

export function setDefaultBudgetPolicy(changes: Partial<BudgetPolicy>): void {
  defaultPolicy = { ...defaultPolicy, ...changes }
}

export function getProjectBudget(projectId: string): number {
  return budgetOverrides.get(projectId) ?? defaultPolicy.monthlyLimit
}

/** Gives a project its own monthly limit, detaching it from the default. */
export function setProjectBudget(projectId: string, monthlyLimit: number): void {
  budgetOverrides.set(projectId, Math.max(0, monthlyLimit))
}

/** Applies one limit to several projects at once. */
export function setProjectBudgets(projectIds: string[], monthlyLimit: number): void {
  for (const projectId of projectIds) {
    setProjectBudget(projectId, monthlyLimit)
  }
}

/** Puts a project back on the organization default. */
export function clearProjectBudget(projectId: string): void {
  budgetOverrides.delete(projectId)
}

/** Demo control: back to the starting scenario. */
export function resetProjectCost(projectId: string): void {
  runRates.delete(projectId)
  budgetOverrides.delete(projectId)
}

/** Demo control: wipes every override, including the organization default. */
export function resetCostStore(): void {
  runRates.clear()
  budgetOverrides.clear()
  defaultPolicy = clonePolicy(INITIAL_POLICY)
}
