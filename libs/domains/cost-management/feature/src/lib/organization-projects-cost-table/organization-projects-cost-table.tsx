import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import {
  Badge,
  BlockContent,
  Button,
  Checkbox,
  Icon,
  InputSearch,
  ProgressBar,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import useBudgetSettings from '../hooks/use-budget-settings/use-budget-settings'
import { SetBudgetModal } from '../set-budget-modal/set-budget-modal'
import { BUDGET_ENFORCEMENT_LABELS, budgetEnforcement } from '../utils/budget-enforcement'
import { formatCost } from '../utils/format-cost'

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

function budgetStatus(percent: number): BudgetStatus {
  if (percent >= 100) return 'over_budget'
  if (percent >= 90) return 'at_risk'
  return 'within_budget'
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
      .filter((row) =>
        statusFilter === 'all'
          ? true
          : budgetStatus((row.cost.forecast / row.cost.policy.monthlyLimit) * 100) === statusFilter
      )
      .sort((a, b) => b.cost.forecast / b.cost.policy.monthlyLimit - a.cost.forecast / a.cost.policy.monthlyLimit)
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
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={
                filter.value === statusFilter
                  ? 'rounded px-2 py-0.5 text-xs font-medium text-brand'
                  : 'rounded px-2 py-0.5 text-xs text-neutral-subtle hover:text-neutral'
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
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
            onClick={() => openBudgetModal(selectedVisible, rows[0]?.cost.policy.monthlyLimit ?? 0)}
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

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral text-xs text-neutral-subtle">
            <th className="w-10 px-4 py-2">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleAll}
                aria-label="Select every visible project"
              />
            </th>
            <th className="px-4 py-2 text-left font-medium">Project</th>
            <th className="px-4 py-2 text-right font-medium">Budget</th>
            <th className="px-4 py-2 text-right font-medium">Forecast</th>
            <th className="w-44 px-4 py-2 text-left font-medium">Consumption</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-left font-medium">Enforcement</th>
            <th className="w-10 px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(({ id, name, cost }) => {
            const percent = (cost.forecast / cost.policy.monthlyLimit) * 100
            const { label, color, barColor } = STATUS_PRESENTATION[budgetStatus(percent)]
            const enforcement = budgetEnforcement(cost)

            return (
              <tr key={id} className="border-b border-neutral last:border-b-0">
                <td className="px-4 py-2.5">
                  <Checkbox
                    checked={selectedIds.includes(id)}
                    onCheckedChange={() => toggleOne(id)}
                    aria-label={`Select ${name}`}
                  />
                </td>
                <td className="px-4 py-2.5 text-neutral">{name}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => openBudgetModal([id], cost.policy.monthlyLimit)}
                    className="group inline-flex items-center gap-1.5 font-mono text-neutral hover:text-brand"
                  >
                    {formatCost(cost.policy.monthlyLimit, cost.policy.currency)}
                    {cost.budgetSource === 'custom' && (
                      <Tooltip content="This project has its own budget, set apart from the organization default">
                        <span className="flex">
                          <Icon iconName="pen" iconStyle="regular" className="text-xs text-neutral-subtle" />
                        </span>
                      </Tooltip>
                    )}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-neutral">
                  {formatCost(cost.forecast, cost.policy.currency)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <ProgressBar.Root mode="absolute" className="h-1.5 flex-1">
                      <ProgressBar.Cell value={Math.min(100, percent)} color={barColor} />
                    </ProgressBar.Root>
                    <span className="w-10 shrink-0 text-right font-mono text-xs text-neutral-subtle">
                      {Math.round(percent)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Badge size="sm" variant="surface" color={color}>
                    {label}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-subtle">{BUDGET_ENFORCEMENT_LABELS[enforcement]}</td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    to="/organization/$organizationId/project/$projectId/settings/cost-budget"
                    params={{ organizationId, projectId: id }}
                    className="text-neutral-subtle hover:text-neutral"
                    aria-label={`Open the budget of ${name}`}
                  >
                    <Icon iconName="arrow-right" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {visibleRows.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-neutral-subtle">No project matches these filters.</p>
      )}
    </BlockContent>
  )
}

export default OrganizationProjectsCostTable
