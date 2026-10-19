import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import {
  Badge,
  BlockContent,
  Button,
  Checkbox,
  Icon,
  InputSearch,
  ProgressBar,
  SegmentedControl,
  TablePrimitives,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import useBudgetSettings from '../hooks/use-budget-settings/use-budget-settings'
import { SetBudgetModal } from '../set-budget-modal/set-budget-modal'
import { BUDGET_ENFORCEMENT_LABELS, budgetConsumption, budgetEnforcement } from '../utils/budget-enforcement'
import { formatCost } from '../utils/format-cost'

const { Table } = TablePrimitives

export interface ProjectCostRow {
  id: string
  name: string
  cost: ProjectCost
}

export interface OrganizationProjectsCostTableProps {
  organizationId: string
  rows: ProjectCostRow[]
}

type BudgetStatus = 'within_budget' | 'at_risk' | 'over_budget'
type StatusFilter = 'all' | BudgetStatus

/** Status follows the enforcement tier, so the badge and the enforcement column never disagree. */
function budgetStatus(cost: ProjectCost): BudgetStatus {
  return match(budgetEnforcement(cost))
    .with('new_resources_blocked', () => 'over_budget' as const)
    .with('scale_up_blocked', () => 'at_risk' as const)
    .otherwise(() => 'within_budget' as const)
}

const STATUS_PRESENTATION: Record<
  BudgetStatus,
  { label: string; color: 'green' | 'yellow' | 'red'; barColor: string }
> = {
  within_budget: { label: 'Within budget', color: 'green', barColor: 'var(--brand-9)' },
  at_risk: { label: 'At risk', color: 'yellow', barColor: 'var(--warning-9)' },
  over_budget: { label: 'Over budget', color: 'red', barColor: 'var(--negative-9)' },
}

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Within budget', value: 'within_budget' },
  { label: 'At risk', value: 'at_risk' },
  { label: 'Over budget', value: 'over_budget' },
]

/** Projects ranked by budget pressure, so the ones needing attention come first. */
export function OrganizationProjectsCostTable({ organizationId, rows }: OrganizationProjectsCostTableProps) {
  const { updateProjectBudgets, resetToDefault } = useBudgetSettings()
  const { openModal } = useModal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows
      .filter((row) => (term ? row.name.toLowerCase().includes(term) : true))
      .filter((row) => statusFilter === 'all' || budgetStatus(row.cost) === statusFilter)
      .sort((a, b) => budgetConsumption(b.cost) - budgetConsumption(a.cost))
  }, [rows, search, statusFilter])

  const visibleIds = visibleRows.map((row) => row.id)
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id))
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length

  const toggleAll = () => setSelectedIds(allVisibleSelected ? [] : visibleIds)

  const toggleOne = (id: string) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))

  const openBudgetModal = (targetIds: string[], currentLimit: number) =>
    openModal({
      content: (
        <SetBudgetModal
          title={targetIds.length === 1 ? 'Project budget' : `Budget for ${targetIds.length} projects`}
          description={
            targetIds.length === 1
              ? 'Overrides the organization default for this project.'
              : 'Applied to every selected project, overriding the organization default.'
          }
          currentLimit={currentLimit}
          onSubmit={(monthlyLimit) => {
            updateProjectBudgets(targetIds, monthlyLimit)
            setSelectedIds([])
          }}
          onResetToDefault={() => {
            resetToDefault(targetIds)
            setSelectedIds([])
          }}
        />
      ),
      options: { width: 480, fakeModal: true },
    })

  return (
    <BlockContent
      title="Projects"
      headRight={
        <SegmentedControl.Root
          aria-label="Filter projects by budget status"
          className="h-7 text-xs"
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          {STATUS_FILTERS.map((filter) => (
            <SegmentedControl.Item key={filter.value} value={filter.value}>
              {filter.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      }
      classNameContent="p-0"
    >
      <div className="border-b border-neutral px-4 py-2">
        <InputSearch placeholder="Search a project" onChange={setSearch} customSize="h-8 text-xs" />
      </div>

      {selectedVisible.length > 0 && (
        <div className="flex items-center gap-3 border-b border-neutral bg-surface-brand-subtle px-4 py-2">
          <span className="text-sm text-neutral">
            {selectedVisible.length} {selectedVisible.length === 1 ? 'project' : 'projects'} selected
          </span>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() =>
              openBudgetModal(
                selectedVisible,
                rows.find((row) => row.id === selectedVisible[0])?.cost.policy.monthlyLimit ?? 0
              )
            }
          >
            Set budget
          </Button>
          <Button
            type="button"
            variant="plain"
            color="neutral"
            size="sm"
            className="ml-auto"
            onClick={() => setSelectedIds([])}
          >
            Clear
          </Button>
        </div>
      )}

      <Table.Root className="w-full" containerClassName="rounded-none border-0">
        <Table.Header>
          <Table.Row className="text-xs text-neutral-subtle">
            <Table.ColumnHeaderCell className="w-10">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleAll}
                aria-label="Select every visible project"
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="text-right">Budget</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="text-right">Forecast</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-44">Consumption</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Enforcement</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-10" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleRows.map(({ id, name, cost }) => {
            const percent = budgetConsumption(cost)
            const { label, color, barColor } = STATUS_PRESENTATION[budgetStatus(cost)]

            return (
              <Table.Row key={id}>
                <Table.Cell>
                  <Checkbox
                    checked={selectedIds.includes(id)}
                    onCheckedChange={() => toggleOne(id)}
                    aria-label={`Select ${name}`}
                  />
                </Table.Cell>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell className="text-right">
                  <Button
                    type="button"
                    variant="plain"
                    color="neutral"
                    size="sm"
                    className="font-mono"
                    aria-label={`Edit the budget of ${name}`}
                    onClick={() => openBudgetModal([id], cost.policy.monthlyLimit)}
                  >
                    {formatCost(cost.policy.monthlyLimit, cost.policy.currency)}
                    {cost.budgetSource === 'custom' && (
                      <Tooltip content="This project has its own budget, set apart from the organization default">
                        <span className="flex">
                          <Icon iconName="pen" iconStyle="regular" className="text-xs text-neutral-subtle" />
                        </span>
                      </Tooltip>
                    )}
                  </Button>
                </Table.Cell>
                <Table.Cell className="text-right font-mono">
                  {formatCost(cost.forecast, cost.policy.currency)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <ProgressBar.Root mode="absolute" className="h-1.5 flex-1">
                      <ProgressBar.Cell value={Math.min(100, percent)} color={barColor} />
                    </ProgressBar.Root>
                    <span className="w-10 shrink-0 text-right font-mono text-xs text-neutral-subtle">
                      {Math.round(percent)}%
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge size="sm" variant="surface" color={color}>
                    {label}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-xs text-neutral-subtle">
                  {BUDGET_ENFORCEMENT_LABELS[budgetEnforcement(cost)]}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Link
                    to="/organization/$organizationId/project/$projectId/settings/cost-budget"
                    params={{ organizationId, projectId: id }}
                    className="text-neutral-subtle hover:text-neutral"
                    aria-label={`Open the budget of ${name}`}
                  >
                    <Icon iconName="arrow-right" />
                  </Link>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>

      {visibleRows.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-neutral-subtle">No project matches these filters.</p>
      )}
    </BlockContent>
  )
}

export default OrganizationProjectsCostTable
