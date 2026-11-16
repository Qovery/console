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
 * The side list of Agents: five entries, then Settings. Custom skill presets come first so people see
 * what their agents will get; Connect is a one-time setup per machine, reached from the Overview (its
 * header button and the last setup step), not from here. Optimize builds sits under Automate as one
 * of the jobs agents do. Settings holds the Copilot and, behind their flag, the Agent Tasks pages.
 * Policy tokens and Settings are for owners and admins only.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const isAgentTasksEnabled = Boolean(useFeatureFlagEnabled(AGENT_TASKS_FLAG))
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const isAdmin = !isLoading && canManage
  const settingsPaths = [`${base}/copilot`, `${base}/agent-task-tokens`, `${base}/mcp-servers`]

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      <Sidebar.Item to={base} icon="table-layout" iconStyle="regular" active={pathname.replace(/\/$/, '') === base}>
        Overview
      </Sidebar.Item>
      <Sidebar.Item
        to={`${base}/skill-presets`}
        icon="sliders"
        iconStyle="regular"
        active={pathname.startsWith(`${base}/skill-presets`)}
      >
        Custom skill presets
      </Sidebar.Item>
      {isAdmin && (
        <Sidebar.Item to={`${base}/policy-tokens`} icon="key" iconStyle="regular">
          Policy tokens
        </Sidebar.Item>
      )}
      <Sidebar.Item to={`${base}/automate`} icon="stairs" iconStyle="regular">
        Automate
      </Sidebar.Item>
      <Sidebar.SubItem to={`${base}/build-optimizer`}>Optimize builds</Sidebar.SubItem>
      <Sidebar.Item
        to={`${base}/agent-activity`}
        icon="wave-pulse"
        iconStyle="regular"
        badge={denied > 0 ? String(denied) : undefined}
        aria-label={denied > 0 ? `Activity, ${denied} denied actions in the last 7 days` : undefined}
      >
        Activity
      </Sidebar.Item>
      {isAdmin && (
        <Sidebar.Group
          title="Settings"
          icon="gear"
          iconStyle="regular"
          className="mt-4"
          defaultOpen={settingsPaths.some((path) => pathname.startsWith(path))}
        >
          <Sidebar.SubItem to={`${base}/copilot`}>Copilot settings</Sidebar.SubItem>
          {isAgentTasksEnabled && <Sidebar.SubItem to={`${base}/agent-task-tokens`}>Model tokens</Sidebar.SubItem>}
          {isAgentTasksEnabled && <Sidebar.SubItem to={`${base}/mcp-servers`}>MCP servers</Sidebar.SubItem>}
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
