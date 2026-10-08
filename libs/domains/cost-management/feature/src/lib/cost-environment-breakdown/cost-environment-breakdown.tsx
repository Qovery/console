import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import { BlockContent, Tooltip } from '@qovery/shared/ui'
import { formatCost } from '../utils/format-cost'

export interface CostEnvironmentBreakdownProps {
  cost: ProjectCost
}

/**
 * Spend per environment.
 *
 * An environment is a namespace, which is the finest unit a cloud provider can
 * attribute Kubernetes cost to — this table is the bridge between a cluster bill
 * and a project budget.
 */
export function CostEnvironmentBreakdown({ cost }: CostEnvironmentBreakdownProps) {
  const { environments, policy } = cost

  return (
    <BlockContent title="Spend by environment" classNameContent="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral text-xs text-neutral-subtle">
            <th className="px-4 py-2 text-left font-medium">Environment</th>
            <th className="px-4 py-2 text-left font-medium">Namespace</th>
            <th className="px-4 py-2 text-right font-medium">Month-to-date</th>
          </tr>
        </thead>
        <tbody>
          {environments.map((environment) => (
            <tr key={environment.environmentId} className="border-b border-neutral last:border-b-0">
              <td className="px-4 py-2.5 text-neutral">{environment.name}</td>
              <td className="px-4 py-2.5">
                <Tooltip content="Cost is attributed to this namespace in the cloud provider's billing data">
                  <span className="font-mono text-xs text-neutral-subtle">{environment.namespace}</span>
                </Tooltip>
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-neutral">
                {formatCost(environment.estimatedSpend, policy.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BlockContent>
  )
}

export default CostEnvironmentBreakdown
