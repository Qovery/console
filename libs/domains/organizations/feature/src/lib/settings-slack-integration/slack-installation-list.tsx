import { useCallback, useEffect, useState } from 'react'
import { useProjects } from '@qovery/domains/projects/feature'
import { BlockContent, Button, Icon, Skeleton, toast, useModal } from '@qovery/shared/ui'
import { SLACK_BOT_API_URL } from '@qovery/shared/util-node-env'
import { AlertRuleForm } from './alert-rule-form'
import { type AlertRule, type SlackChannel, type SlackInstallation } from './types'

function formatScope(rule: AlertRule, projects: { id: string; name: string }[]): string {
  if (rule.qovery_environment_ids?.length > 0) {
    const projectNames = projects
      .filter((p) => rule.qovery_project_ids?.includes(p.id))
      .map((p) => p.name)
    const count = rule.qovery_environment_ids.length
    return `${count} env${count > 1 ? 's' : ''}${projectNames.length > 0 ? ` · ${projectNames.join(', ')}` : ''}`
  }
  if (rule.qovery_project_ids?.length > 0) {
    const projectNames = projects
      .filter((p) => rule.qovery_project_ids.includes(p.id))
      .map((p) => p.name)
    return projectNames.length > 0 ? projectNames.join(', ') : 'Selected projects'
  }
  return 'All projects'
}

const SlackIntegrationSkeleton = () => (
  <BlockContent title="Workspace" classNameContent="p-0">
    {[0, 1].map((index) => (
      <div key={index} className="flex items-center justify-between border-b border-neutral p-4 last:border-0">
        <Skeleton width={200} height={16} show />
      </div>
    ))}
  </BlockContent>
)

export function SlackInstallationList({
  organizationId,
  onInstallationsLoaded,
}: {
  organizationId: string
  onInstallationsLoaded: (hasInstallation: boolean) => void
}) {
  const [installations, setInstallations] = useState<SlackInstallation[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loading, setLoading] = useState(true)
  const { openModal, closeModal } = useModal()
  const { data: projects } = useProjects({ organizationId })

  const channelNameMap = new Map(channels.map((ch) => [ch.id, ch.name]))

  const fetchData = useCallback(async () => {
    if (!SLACK_BOT_API_URL) return

    try {
      const [installsRes, rulesRes, channelsRes] = await Promise.all([
        fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/installations`),
        fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules`),
        fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/channels`),
      ])

      if (installsRes.ok) {
        const data = await installsRes.json()
        setInstallations(data)
        onInstallationsLoaded(data.length > 0)
      }
      if (rulesRes.ok) setAlertRules(await rulesRes.json())
      if (channelsRes.ok) setChannels(await channelsRes.json())
    } catch (error) {
      console.error('Failed to fetch Slack integration data:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId, onInstallationsLoaded])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <SlackIntegrationSkeleton />

  const hasInstallation = installations.length > 0
  const firstInstallation = installations[0]

  return (
    <div className="flex flex-col gap-6">
      <BlockContent title="Workspace" classNameContent="p-0">
        {hasInstallation ? (
          <ul className="flex flex-col">
            {installations.map((install) => (
              <li
                key={install.id}
                className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon iconName="slack" iconStyle="brands" className="text-lg" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-neutral">{install.slack_team_name}</p>
                    <p className="text-xs text-neutral-subtle">Connected</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  iconOnly
                  color="neutral"
                  size="md"
                  aria-label="Disconnect workspace"
                  onClick={async () => {
                    if (!SLACK_BOT_API_URL) return
                    try {
                      const res = await fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/installations`, {
                        method: 'DELETE',
                      })
                      if (res.ok) {
                        toast('success', 'Slack workspace disconnected')
                        fetchData()
                      } else {
                        toast('error', 'Failed to disconnect workspace')
                      }
                    } catch {
                      toast('error', 'An error occurred')
                    }
                  }}
                >
                  <Icon iconName="trash-can" iconStyle="regular" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center">
            <Icon iconName="slack" iconStyle="brands" className="text-2xl text-neutral-subtle" />
            <p className="mt-2 text-sm text-neutral-subtle">
              No Slack workspace connected. Click "Add to Slack" to get started.
            </p>
          </div>
        )}
      </BlockContent>

      {hasInstallation && (
        <BlockContent
          title="Alert rules"
          classNameContent="p-0"
          headRight={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!firstInstallation) return
                openModal({
                  content: (
                    <AlertRuleForm
                      organizationId={organizationId}
                      installationId={firstInstallation.id}
                      onSaved={() => {
                        closeModal()
                        fetchData()
                      }}
                      onCancel={closeModal}
                    />
                  ),
                })
              }}
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add rule
            </Button>
          }
        >
          {alertRules.length > 0 ? (
            <ul className="flex flex-col">
              {alertRules.map((rule) => {
                const channelName = channelNameMap.get(rule.slack_channel_id)
                return (
                  <li
                    key={rule.id}
                    className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-neutral">
                        {rule.name || (channelName ? `#${channelName}` : rule.slack_channel_id)}
                      </p>
                      <div className="flex gap-3 text-xs text-neutral-subtle">
                        {channelName && <span>#{channelName}</span>}
                        <span>{formatScope(rule, projects ?? [])}</span>
                        <span>·</span>
                        <span>{rule.environment_types.join(', ')}</span>
                        <span>·</span>
                        <span>
                          {[
                            rule.alert_deployment_failed && 'Failed',
                            rule.alert_failure_loop && 'Loop',
                            rule.alert_recovered && 'Recovered',
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
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
                                onSaved={() => {
                                  closeModal()
                                  fetchData()
                                }}
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
                        onClick={async () => {
                          if (!SLACK_BOT_API_URL) return
                          try {
                            const res = await fetch(
                              `${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules/${rule.id}`,
                              { method: 'DELETE' }
                            )
                            if (res.ok) {
                              toast('success', 'Alert rule deleted')
                              fetchData()
                            } else {
                              toast('error', 'Failed to delete alert rule')
                            }
                          } catch {
                            toast('error', 'An error occurred')
                          }
                        }}
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
      )}
    </div>
  )
}
