import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Reorder } from 'framer-motion'
import { type Cluster, type ProjectDeploymentRule } from 'qovery-typescript-axios'
import { type ReactNode, Suspense, useEffect, useState } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { BlockContent, Button, DropdownMenu, EmptyState, Heading, Icon, Section, Skeleton } from '@qovery/shared/ui'
import { dateToHours } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { useDeleteDeploymentRule } from '../hooks/use-delete-deployment-rule/use-delete-deployment-rule'
import { useEditDeploymentRulesPriorityOrder } from '../hooks/use-edit-deployment-rules-priority-order/use-edit-deployment-rules-priority-order'
import { useListDeploymentRules } from '../hooks/use-list-deployment-rules/use-list-deployment-rules'

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const RULE_ROW_CLASS =
  'flex items-center justify-between border-b border-neutral bg-surface-neutral-subtle px-5 py-4 last:border-0'
const RULE_SKELETON_WIDTHS = [42, 57, 48]

function DeploymentRulesListSkeleton() {
  return (
    <BlockContent title="Configured rules" classNameContent="p-0" className="overflow-hidden">
      <ul>
        {RULE_SKELETON_WIDTHS.map((width, index) => (
          <li key={index} className={RULE_ROW_CLASS}>
            <div className="min-w-0 flex-1">
              <Skeleton width={`${width}%`} height={16} />
              <Skeleton className="mt-2" width={`${Math.min(width + 15, 80)}%`} height={12} />
            </div>
            <div className="flex gap-2">
              <Skeleton width={36} height={36} square />
              <Skeleton width={36} height={36} square />
            </div>
          </li>
        ))}
      </ul>
    </BlockContent>
  )
}

function DeploymentRulesEmptyStateSkeleton() {
  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-neutral px-6 py-10">
      <Skeleton width={48} height={48} rounded />
      <Skeleton className="mt-6 w-full max-w-72" height={18} />
      <Skeleton className="mt-3 w-full max-w-lg" height={14} />
      <Skeleton className="mt-2 w-full max-w-md" height={14} />
      <Skeleton className="mt-6" width={136} height={36} />
    </div>
  )
}

function DeploymentRulesContentSkeleton({ hasRules }: { hasRules: boolean }) {
  return hasRules ? <DeploymentRulesListSkeleton /> : <DeploymentRulesEmptyStateSkeleton />
}

interface DeploymentRulesContentProps {
  organizationId: string
  projectId: string
  linkNewRule: string
}

function DeploymentRulesContent({ organizationId, projectId, linkNewRule }: DeploymentRulesContentProps) {
  const navigate = useNavigate()
  const { data: deploymentRules = [] } = useListDeploymentRules({ projectId, suspense: true })
  const { mutate: deleteDeploymentRule } = useDeleteDeploymentRule()
  const { mutate: deploymentRuleOrder } = useEditDeploymentRulesPriorityOrder()
  const { data: clusters = [] } = useQuery({
    ...queries.clusters.list({ organizationId }),
    suspense: true,
    select(items) {
      items?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return items as Cluster[]
    },
  })

  const [listRules, setListRules] = useState<ProjectDeploymentRule[]>(deploymentRules)
  const hasClusters = clusters.length > 0

  const updateDeploymentRulesOrder = (rules: ProjectDeploymentRule[]) => {
    deploymentRuleOrder({
      projectId,
      deploymentRulesPriorityOrderRequest: {
        project_deployment_rule_ids_in_order: rules.map((deploymentRule) => deploymentRule.id),
      },
    })
  }

  const removeDeploymentRule = (deploymentRuleId: string) => {
    deleteDeploymentRule({ projectId, deploymentRuleId })
  }

  const handleReorder = (rules: ProjectDeploymentRule[]) => {
    setListRules(rules)
    updateDeploymentRulesOrder(rules)
  }

  useEffect(() => {
    setListRules(deploymentRules)
  }, [deploymentRules])

  const isWeekdays = (weekDays: string[]): boolean => {
    return WEEKDAYS.every((weekday) => weekDays.includes(weekday))
  }

  const deploymentRuleEditPath = (ruleId: string) =>
    `/organization/${organizationId}/project/${projectId}/deployment-rules/edit/${ruleId}`

  const renderRuleDays = (weekDays: string[]): ReactNode => {
    if (isWeekdays(weekDays) && weekDays.length < 7) {
      return ' - Running every weekday'
    }

    if (weekDays.length === 7) {
      return ' - Running everyday'
    }

    return (
      <>
        {' - '}
        {weekDays.map((day: string, dayIndex: number) => (
          <span key={dayIndex}>
            {upperCaseFirstLetter(day.toLowerCase())?.slice(0, 3)}
            {dayIndex !== weekDays.length - 1 && ', '}
          </span>
        ))}
      </>
    )
  }

  const renderRuleRowContent = (
    rule: ProjectDeploymentRule,
    {
      withDragButton = false,
      preventCloseAutoFocus = false,
    }: { withDragButton?: boolean; preventCloseAutoFocus?: boolean }
  ) => {
    const dropdownContentProps = preventCloseAutoFocus
      ? { onCloseAutoFocus: (event: Event) => event.preventDefault() }
      : {}

    return (
      <>
        <div>
          <h3 className="mb-1 max-w-full truncate text-sm font-medium text-neutral">{rule.name}</h3>
          <p data-testid="time" className="max-w-full truncate text-xs text-neutral">
            {dateToHours(rule.start_time)} - {dateToHours(rule.stop_time)}
            {renderRuleDays(rule.weekdays)}
          </p>
        </div>
        <div className="flex gap-2">
          {withDragButton && (
            <Button type="button" size="md" variant="outline" iconOnly aria-label="Drag rule">
              <Icon iconName="grip-lines" />
            </Button>
          )}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" size="md" variant="outline" iconOnly>
                <Icon iconName="ellipsis-vertical" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content {...dropdownContentProps}>
              <DropdownMenu.Item
                icon={<Icon iconName="pen" iconStyle="regular" />}
                onSelect={() =>
                  navigate({
                    to: deploymentRuleEditPath(rule.id),
                  })
                }
              >
                Edit rule
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                color="red"
                icon={<Icon iconName="trash-can" iconStyle="regular" />}
                onSelect={() => removeDeploymentRule(rule.id)}
              >
                Delete rule
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </>
    )
  }

  return listRules.length === 0 ? (
    <EmptyState
      title={hasClusters ? 'No deployment rules found' : 'Create your Cluster first 💫'}
      icon={hasClusters ? 'ruler' : 'cube'}
      description={
        hasClusters
          ? 'Deployment rules allows you to apply defaults rule to all newly created environments.'
          : 'Deploying a cluster is necessary to start using Qovery and create your first Deployment Rules'
      }
    >
      <Button
        className="gap-2"
        size="md"
        variant="outline"
        onClick={() =>
          hasClusters ? navigate({ to: linkNewRule }) : navigate({ to: `/organization/${organizationId}/clusters/new` })
        }
      >
        {hasClusters ? 'Add rule' : 'Create a Cluster'}
        <Icon iconName="circle-plus" iconStyle="regular" />
      </Button>
    </EmptyState>
  ) : (
    <BlockContent title="Configured rules" classNameContent="p-0" className="overflow-hidden">
      {listRules.length > 1 ? (
        <Reorder.Group as="ul" axis="y" values={listRules} onReorder={handleReorder}>
          {listRules.map((rule) => (
            <Reorder.Item as="li" key={rule.id} value={rule} data-testid="item" className={RULE_ROW_CLASS}>
              {renderRuleRowContent(rule, { withDragButton: true })}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <ul>
          <li data-testid="item" className={RULE_ROW_CLASS}>
            {renderRuleRowContent(listRules[0], { preventCloseAutoFocus: true })}
          </li>
        </ul>
      )}
    </BlockContent>
  )
}

export function DeploymentRules() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { projectId = '', organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Deployment rules - Qovery')

  const linkNewRule = `/organization/${organizationId}/project/${projectId}/deployment-rules/create`
  const cachedDeploymentRules =
    queryClient.getQueryData<ProjectDeploymentRule[]>(queries.projects.listDeploymentRules({ projectId }).queryKey) ??
    []

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="pt-6">
        <div className="mb-8 flex w-full justify-between gap-2 border-b border-neutral">
          <div className="flex flex-col gap-2 pb-6">
            <Heading> Deployment rules</Heading>
            <p className="max-w-2xl text-sm text-neutral-subtle">
              Configure your default deployment rules. Drag & drop rules to prioritize them.
            </p>
            <NeedHelp className="mt-2" />
          </div>
          <Button size="md" onClick={() => navigate({ to: linkNewRule })}>
            Add rule <Icon className="ml-2" iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <Suspense fallback={<DeploymentRulesContentSkeleton hasRules={cachedDeploymentRules.length > 0} />}>
            <DeploymentRulesContent organizationId={organizationId} projectId={projectId} linkNewRule={linkNewRule} />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}

export default DeploymentRules
