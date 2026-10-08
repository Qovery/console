/**
 * PROTOTYPE — cost management domain types.
 *
 * These types describe the shape a real Cost API would expose. Nothing here is
 * persisted: the values are served from an in-memory store (see `cost-store.ts`).
 */

export type Currency = 'USD'

/** Resource footprint of a single service, used to estimate a monthly cost. */
export interface ServiceResources {
  cpuMilli: number
  ramMib: number
  /** Number of running instances. `1` for services that do not scale horizontally. */
  instances: number
  gpu?: number
  storageGib?: number
  /** Managed databases and load balancers are billed as flat monthly add-ons. */
  managedDatabases?: number
  loadBalancers?: number
}

export interface BudgetThreshold {
  percent: number
  /** What the platform team's policy does when this threshold is crossed. */
  action: string
}

/** Where a budget increase request lands. */
export type ApprovalChannel = 'email' | 'slack'

export interface BudgetPolicy {
  /** Name of the organization-level policy this project inherits from. */
  name: string
  monthlyLimit: number
  currency: Currency
  thresholds: BudgetThreshold[]
  /** Who reviews budget increase requests. */
  approver: string
  approvalChannel: ApprovalChannel
}

/** Whether a project runs on the organization default or on its own limit. */
export type BudgetSource = 'inherited' | 'custom'

/**
 * What the policy is currently doing to a project.
 *
 * Production is never suspended — stopping a live environment to save money is a
 * worse outcome than the overspend. That is why a project can sit over budget
 * rather than simply being switched off.
 */
export type BudgetEnforcement = 'none' | 'owner_notified' | 'scale_up_blocked' | 'new_resources_blocked'

export interface EnvironmentSpend {
  environmentId: string
  name: string
  /** Kubernetes namespace — the unit AWS can attribute cost to. */
  namespace: string
  estimatedSpend: number
}

export interface ProjectCost {
  projectId: string
  policy: BudgetPolicy
  budgetSource: BudgetSource
  /** Month-to-date spend computed from running resources. Near real-time. */
  estimatedSpend: number
  /** Month-to-date spend reconciled against the cloud provider's billing data. */
  reconciledSpend: number
  /** When the reconciled figure was last refreshed. */
  reconciledAt: string
  /** Month-to-date spend extrapolated to the end of the billing period. */
  forecast: number
  /** First day of the next billing period. */
  resetsOn: string
  environments: EnvironmentSpend[]
}

/** An operation whose cost impact must be evaluated before it runs. */
export type CostOperation =
  | {
      type: 'scale_service'
      serviceName: string
      before: ServiceResources
      after: ServiceResources
    }
  | {
      type: 'deploy_environment'
      environmentName: string
      /** Footprint of every service in the environment. */
      resources: ServiceResources[]
    }

export type PolicyDenialReason = 'project_monthly_budget_exceeded' | 'project_monthly_budget_exhausted'

export interface PolicyEvaluation {
  allowed: boolean
  reason?: PolicyDenialReason
  /** Monthly run rate of what the operation targets, once applied. */
  operationMonthlyCost: number
  /** Monthly cost added (or removed) by the operation. */
  monthlyDelta: number
  /** Forecast before the operation. */
  currentForecast: number
  /** Forecast once the operation is applied. */
  projectedForecast: number
  budget: number
  currency: Currency
  /**
   * Largest instance count that still fits the budget. Only set when a
   * `scale_service` operation is denied because of horizontal scaling — it lets
   * the UI (and an agent) propose a smaller target instead of a bare refusal.
   */
  maxAllowedInstances?: number
}
