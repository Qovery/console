import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Section } from '@qovery/shared/ui'
import { CostBudgetCard } from '../cost-budget-card/cost-budget-card'
import { CostDemoControls } from '../cost-demo-controls/cost-demo-controls'
import { CostEnvironmentBreakdown } from '../cost-environment-breakdown/cost-environment-breakdown'
import { CostPolicyThresholds } from '../cost-policy-thresholds/cost-policy-thresholds'
import useProjectCost from '../hooks/use-project-cost/use-project-cost'
import { requestBudgetIncrease } from '../request-budget-increase/request-budget-increase'

export interface PageProjectCostBudgetProps {
  projectId: string
  projectName?: string
}

export function PageProjectCostBudget({ projectId, projectName }: PageProjectCostBudgetProps) {
  const { data: cost } = useProjectCost({ projectId, suspense: true })

  if (!cost) return null

  const forecastPercent = (cost.forecast / cost.policy.monthlyLimit) * 100

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Cost & budget"
        description="What this project is allowed to spend. Qovery evaluates every deployment and scale-up against this budget before it runs."
        showNeedHelp={false}
      >
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="md"
          onClick={() => requestBudgetIncrease(projectName)}
        >
          <Icon iconName="arrow-up-right-dots" className="mr-1.5" />
          Request more budget
        </Button>
      </SettingsHeading>

      <div className="max-w-content-with-navigation-left">
        <CostBudgetCard cost={cost} />
        <CostPolicyThresholds policy={cost.policy} forecast={cost.forecast} />
        <CostEnvironmentBreakdown cost={cost} />

        <p className="text-xs text-neutral-subtle">
          This is an operational budget, not a guaranteed cloud invoice cap. Qovery blocks or suspends the operations it
          governs when the project reaches its limit; charges already accrued and resources outside Qovery's control are
          not covered.
        </p>

        <CostDemoControls projectId={projectId} currentPercent={forecastPercent} />
      </div>
    </Section>
  )
}

export default PageProjectCostBudget
