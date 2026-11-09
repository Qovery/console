import { useQuery } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useProjects } from '@qovery/domains/projects/feature'
import { type AlertRule } from '@qovery/shared/slack-bot/data-access'
import {
  useCreateSlackAlertRule,
  useDeleteSlackAlertRule,
  useDeleteSlackInstallation,
} from '@qovery/shared/slack-bot/feature'
import { BlockContent, Button, Icon, Skeleton, Truncate, useModal } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { AlertRuleForm } from './alert-rule-form'

function formatScope(rule: AlertRule, projects: { id: string; name: string }[]): string {
  if (rule.environment_ids?.length > 0) {
    const projectNames = projects.filter((p) => rule.project_ids?.includes(p.id)).map((p) => p.name)
    const count = rule.environment_ids.length
    return `${count} env${count > 1 ? 's' : ''}${projectNames.length > 0 ? ` ${projectNames.join(', ')}` : ''}`
  }
  if (rule.project_ids?.length > 0) {
    const projectNames = projects.filter((p) => rule.project_ids.includes(p.id)).map((p) => p.name)
    return projectNames.length > 0 ? projectNames.join(', ') : 'Selected projects'
  }
  return 'All projects'
}

const SlackIntegrationSkeleton = () => (
  <BlockContent title="Alert rules" classNameContent="p-0">
    {[0, 1].map((index) => (
      <div key={index} className="flex items-center justify-between border-b border-neutral p-4 last:border-0">
        <Skeleton width={200} height={16} show />
      </div>
    ))}
  </BlockContent>
)

export function SlackInstallationList({
  organizationId,
  onConnectSlack,
  children,
}: {
  organizationId: string
  onConnectSlack: () => void
  children: (hasInstallation: boolean, onAddRule: () => void) => ReactNode
}) {
  const { openModal, closeModal } = useModal()
  const { data: projects } = useProjects({ organizationId })

  const {
    data: installations = [],
    isLoading: isLoadingInstallations,
    isError: isInstallationsError,
    refetch: refetchInstallations,
  } = useQuery({
    ...queries.slackBot.installations({ organizationId }),
  })

  const { data: alertRules = [], isLoading: isLoadingRules } = useQuery({
    ...queries.slackBot.alertRules({ organizationId }),
  })

  const { data: channels = [] } = useQuery({
    ...queries.slackBot.channels({ organizationId }),
  })

  const deleteInstallation = useDeleteSlackInstallation({ organizationId })
  const deleteAlertRule = useDeleteSlackAlertRule({ organizationId })

  const channelNameMap = new Map(channels.map((ch) => [ch.id, ch.name]))

  const activeInstallations = installations.filter((i) => i.active && !i.error_state)
  const hasInstallation = activeInstallations.length > 0
  const firstInstallation = activeInstallations[0]

  const openAddRuleModal = () => {
    if (!firstInstallation) return
    openModal({
      content: (
        <AlertRuleForm
          organizationId={organizationId}
          installationId={firstInstallation.id}
          onSaved={closeModal}
          onCancel={closeModal}
        />
      ),
    })
  }

  const isLoading = isLoadingInstallations || isLoadingRules

  if (isLoading) {
    return (
      <>
        {children(false, openAddRuleModal)}
        <div className="max-w-content-with-navigation-left">
          <SlackIntegrationSkeleton />
        </div>
      </>
    )
  }

  if (isInstallationsError) {
    return (
      <>
        {children(false, openAddRuleModal)}
        <div className="max-w-content-with-navigation-left">
          <div className="flex flex-col items-center justify-center overflow-hidden rounded border border-dashed border-neutral bg-surface-neutral p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-neutral">
              <Icon iconName="triangle-exclamation" className="text-xl text-red-500" />
            </div>
            <p className="font-medium">Failed to load Slack integration</p>
            <p className="mb-3 text-sm text-neutral-subtle">
              Unable to reach the Slack service. Please try again later.
            </p>
            <Button size="md" variant="outline" color="neutral" onClick={() => refetchInstallations()}>
              <Icon iconName="arrow-rotate-right" />
              Retry
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (!hasInstallation) {
    return (
      <>
        {children(false, openAddRuleModal)}
        <div className="max-w-content-with-navigation-left">
          <div className="flex flex-col items-center justify-center overflow-hidden rounded border border-dashed border-neutral bg-surface-neutral p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-neutral">
              <Icon iconName="slack" iconStyle="brands" className="text-xl" />
            </div>
            <p className="font-medium">No Slack workspace connected</p>
            <p className="mb-3 text-sm text-neutral-subtle">
              Connect your Slack workspace to start receiving deployment alerts.
            </p>
            <Button size="md" variant="outline" color="neutral" onClick={onConnectSlack}>
              <Icon iconName="slack" iconStyle="brands" />
              Connect Slack
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {children(true, openAddRuleModal)}
      <div className="max-w-content-with-navigation-left">
        <div className="flex flex-col gap-6">
          <BlockContent title="Workspace" classNameContent="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Icon iconName="slack" iconStyle="brands" className="text-lg" />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-neutral">{firstInstallation.slack_team_name}</p>
                  <p className="text-xs text-neutral-subtle">Connected</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" color="neutral" size="sm" onClick={onConnectSlack}>
                  Reconnect
                </Button>
                <Button
                  variant="outline"
                  iconOnly
                  color="neutral"
                  size="sm"
                  aria-label="Disconnect workspace"
                  onClick={() => deleteInstallation.mutate()}
                >
                  <Icon iconName="trash-can" iconStyle="regular" />
                </Button>
              </div>
            </div>
          </BlockContent>

          <BlockContent title="Alert rules" classNameContent="p-0">
            {alertRules.length > 0 ? (
              <ul className="flex flex-col">
                {alertRules.map((rule) => {
                  const channelName = channelNameMap.get(rule.slack_channel_id)
                  const alertTypes = [
                    rule.alert_deployment_failed && 'Failed',
                    rule.alert_failure_loop && 'Loop',
                    rule.alert_recovered && 'Recovered',
                  ]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <li
                      key={rule.id}
                      className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
                    >
                      <div>
                        <h2 className="mb-1 flex text-xs font-medium text-neutral">
                          <Truncate
                            truncateLimit={60}
                            text={rule.name || (channelName ? `#${channelName}` : rule.slack_channel_id)}
                          />
                        </h2>
                        <p className="text-xs text-neutral-subtle">
                          {channelName && <span className="mr-3 inline-block">#{channelName}</span>}
                          <span className="mr-3 inline-block">{formatScope(rule, projects ?? [])}</span>
                          <span className="mr-3 inline-block">{rule.environment_types.join(', ')}</span>
                          <span className="inline-block">{alertTypes}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          iconOnly
                          color="neutral"
                          size="md"
                          aria-label="Edit alert rule"
                          onClick={() => {
                            if (!firstInstallation) return
                            openModal({
                              content: (
                                <AlertRuleForm
                                  organizationId={organizationId}
                                  installationId={firstInstallation.id}
                                  existingRule={rule}
                                  onSaved={closeModal}
                                  onCancel={closeModal}
                                />
                              ),
                            })
                          }}
                        >
                          <Icon iconName="pen" iconStyle="regular" />
                        </Button>
                        <Button
                          variant="outline"
                          iconOnly
                          color="neutral"
                          size="md"
                          aria-label="Delete alert rule"
                          onClick={() => deleteAlertRule.mutate({ ruleId: rule.id })}
                        >
                          <Icon iconName="trash-can" iconStyle="regular" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-neutral-subtle">No alert rules configured yet.</p>
              </div>
            )}
          </BlockContent>
        </div>
      </div>
    </>
  )
}
