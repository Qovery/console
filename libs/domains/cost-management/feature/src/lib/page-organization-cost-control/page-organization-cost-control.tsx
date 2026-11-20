import { getDefaultBudgetPolicy } from '@qovery/domains/cost-management/data-access'
import { useProjects } from '@qovery/domains/projects/feature'
import { EmptyState, Heading, Section } from '@qovery/shared/ui'
import { BudgetPolicyCard } from '../budget-policy-card/budget-policy-card'
import useProjectsCost from '../hooks/use-projects-cost/use-projects-cost'
import { OrganizationCostSummary } from '../organization-cost-summary/organization-cost-summary'
import { OrganizationProjectsCostTable } from '../organization-projects-cost-table/organization-projects-cost-table'

export interface PageOrganizationCostControlProps {
  organizationId: string
}

export function PageOrganizationCostControl({ organizationId }: PageOrganizationCostControlProps) {
  const { data: projects = [] } = useProjects({ organizationId, suspense: true })
  const { data: costs = {} } = useProjectsCost({
    projectIds: projects.map((project) => project.id),
    suspense: true,
  })

  const rows = projects
    .filter((project) => costs[project.id])
    .map((project) => ({ id: project.id, name: project.name, cost: costs[project.id] }))

  const inheritingProjects = rows.filter((row) => row.cost.budgetSource === 'inherited').length

  return (
    <Section className="px-8 pb-8 pt-6">
      <div className="mb-6">
        <Heading>Cost control</Heading>
        <p className="mt-2 max-w-2xl text-sm text-neutral-subtle">
          Permissions decide what someone may do. Budgets decide how much they may spend doing it. Qovery evaluates
          every deployment and scale-up against both before it runs.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No projects yet" description="Budgets appear here once the organization has a project." />
      ) : (
        <>
          <OrganizationCostSummary costs={rows.map((row) => row.cost)} />
          <BudgetPolicyCard policy={getDefaultBudgetPolicy()} inheritingProjects={inheritingProjects} />
          <OrganizationProjectsCostTable organizationId={organizationId} rows={rows} />
          <p className="text-xs text-neutral-subtle">
            These are operational budgets, not guaranteed cloud invoice caps. Qovery blocks or suspends the operations
            it governs when a project reaches its limit; charges already accrued and resources outside Qovery's control
            are not covered.
          </p>
        </>
      )}
    </Section>
  )
}

export default PageOrganizationCostControl
