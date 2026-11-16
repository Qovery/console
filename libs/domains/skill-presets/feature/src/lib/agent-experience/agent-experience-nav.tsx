import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode, useEffect, useMemo } from 'react'
import { Sidebar } from '@qovery/shared/ui'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

const AGENT_TASKS_FLAG = 'argentic-workflow'
const DAY_MS = 24 * 3_600_000

/** Denied agent actions over the last 7 days, for the Activity badge (like open issues on Alerts). */
function useDeniedThisWeek(organizationId: string, scope: 'organization' | 'me', enabled: boolean) {
  const to = useMemo(() => new Date(Math.ceil(Date.now() / 60_000) * 60_000), [])
  const { data } = useAgentActivity({
    organizationId,
    scope,
    enabled,
    from: new Date(to.getTime() - 7 * DAY_MS).toISOString(),
    to: to.toISOString(),
    bucket: 'DAY',
  })
  return data?.totals.denials ?? 0
}

/**
 * The side list of Agents, in the order of the setup: connect, choose presets, limit with policy
 * tokens, automate, watch the activity. Copilot, a separate surface, comes last. Policy tokens are
 * for owners and admins only. The Agent Tasks pages (model tokens, MCP servers) follow their feature flag.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const isAgentTasksEnabled = Boolean(useFeatureFlagEnabled(AGENT_TASKS_FLAG))
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      <Sidebar.Item to={base} icon="table-layout" iconStyle="regular" active={pathname.replace(/\/$/, '') === base}>
        Overview
      </Sidebar.Item>
      <Sidebar.Item to={`${base}/connect`} icon="plug" iconStyle="regular">
        Connect
      </Sidebar.Item>
      <Sidebar.Item
        to={`${base}/skill-presets`}
        icon="sliders"
        iconStyle="regular"
        active={pathname.startsWith(`${base}/skill-presets`)}
      >
        Skill presets
      </Sidebar.Item>
      {!isLoading && canManage && (
        <Sidebar.Item to={`${base}/policy-tokens`} icon="key" iconStyle="regular">
          Policy tokens
        </Sidebar.Item>
      )}
      <Sidebar.Item to={`${base}/automate`} icon="stairs" iconStyle="regular">
        Automate
      </Sidebar.Item>
      <Sidebar.Item
        to={`${base}/agent-activity`}
        icon="wave-pulse"
        iconStyle="regular"
        badge={denied > 0 ? String(denied) : undefined}
        aria-label={denied > 0 ? `Activity, ${denied} denied actions in the last 7 days` : undefined}
      >
        Activity
      </Sidebar.Item>
      <Sidebar.Item to={`${base}/copilot`} icon="message-bot" iconStyle="regular">
        Copilot
      </Sidebar.Item>
      {isAgentTasksEnabled && canManage && (
        <Sidebar.Group
          title="Agent Tasks"
          icon="robot"
          iconStyle="regular"
          defaultOpen={pathname.startsWith(`${base}/agent-task-tokens`) || pathname.startsWith(`${base}/mcp-servers`)}
        >
          <Sidebar.SubItem to={`${base}/agent-task-tokens`}>Model tokens</Sidebar.SubItem>
          <Sidebar.SubItem to={`${base}/mcp-servers`}>MCP servers</Sidebar.SubItem>
        </Sidebar.Group>
      )}
    </Sidebar.Root>
  )
}

/** Agent Tasks pages exist only behind their feature flag: without it, back to the Overview. */
export function AgentTasksGate({ children }: { children: ReactNode }) {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const isAgentTasksEnabled = Boolean(useFeatureFlagEnabled(AGENT_TASKS_FLAG))
  useEffect(() => {
    if (!isAgentTasksEnabled) {
      navigate({ to: '/organization/$organizationId/agent-experience', params: { organizationId }, replace: true })
    }
  }, [isAgentTasksEnabled, navigate, organizationId])
  return isAgentTasksEnabled ? <>{children}</> : null
}
