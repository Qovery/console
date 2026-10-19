import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import { BlockContent, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { formatCost } from '../utils/format-cost'

const { Table } = TablePrimitives

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
      <Table.Root className="w-full" containerClassName="rounded-none border-0">
        <Table.Header>
          <Table.Row className="text-xs text-neutral-subtle">
            <Table.ColumnHeaderCell>Environment</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Namespace</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="text-right">Month-to-date</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {environments.map((environment) => (
            <Table.Row key={environment.environmentId}>
              <Table.Cell>{environment.name}</Table.Cell>
              <Table.Cell>
                <Tooltip content="Cost is attributed to this namespace in the cloud provider's billing data">
                  <span className="font-mono text-xs text-neutral-subtle">{environment.namespace}</span>
                </Tooltip>
              </Table.Cell>
              <Table.Cell className="text-right font-mono">
                {formatCost(environment.estimatedSpend, policy.currency)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </BlockContent>
  )
}

export default CostEnvironmentBreakdown
