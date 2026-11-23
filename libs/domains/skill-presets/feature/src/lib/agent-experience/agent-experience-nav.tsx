import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode, useEffect } from 'react'
import { Sidebar } from '@qovery/shared/ui'
import { activityWindowEnd } from '../agent-activity/activity-search'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManagePolicyTokens } from '../hooks/use-can-manage-policy-tokens/use-can-manage-policy-tokens'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

const AGENT_TASKS_FLAG = 'argentic-workflow'
const DAY_MS = 24 * 3_600_000

/** Denied agent actions over the last 7 days, for the Activity badge (like open issues on Alerts). */
function useDeniedThisWeek(organizationId: string, scope: 'organization' | 'me', enabled: boolean) {
  const to = activityWindowEnd()
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
 * The side list of Agents: the Skills registry, Automations and Activity, then Settings. Settings holds
 * policy tokens and Copilot according to role, and the Agent Tasks pages behind their flag.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const isAgentTasksEnabled = Boolean(useFeatureFlagEnabled(AGENT_TASKS_FLAG))
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const { canManage: canManageTokens, isLoading: isTokenRoleLoading } = useCanManagePolicyTokens({ organizationId })
  const registryPath = `${base}/skill-presets`
  const isRegistryPage = pathname === registryPath || pathname.startsWith(`${registryPath}/`)

  const isAdmin = !isLoading && canManage
  const canSeeTokens = !isTokenRoleLoading && canManageTokens
  const settingsPaths = [`${base}/policy-tokens`, `${base}/copilot`, `${base}/agent-task-tokens`, `${base}/mcp-servers`]

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      <Sidebar.Item to={registryPath} icon="sliders" iconStyle="regular" active={isRegistryPage}>
        Skills registry
      </Sidebar.Item>
      {isAgentTasksEnabled && (
        <Sidebar.Item to={`${base}/automate`} icon="stairs" iconStyle="regular">
          Automations
        </Sidebar.Item>
      )}
      <Sidebar.Item
        to={`${base}/agent-activity`}
        icon="wave-pulse"
        iconStyle="regular"
        badge={denied > 0 ? String(denied) : undefined}
        aria-label={
          denied > 0
            ? `Activity, ${denied} denied ${denied === 1 ? 'action' : 'actions'} in the last 7 days`
            : undefined
        }
      >
        Activity
      </Sidebar.Item>
      {(isAdmin || canSeeTokens || isAgentTasksEnabled) && (
        <Sidebar.Group
          title="Settings"
          icon="gear"
          iconStyle="regular"
          defaultOpen={settingsPaths.some((path) => pathname.startsWith(path))}
        >
          {canSeeTokens && <Sidebar.SubItem to={`${base}/policy-tokens`}>Policy tokens</Sidebar.SubItem>}
          {isAdmin && <Sidebar.SubItem to={`${base}/copilot`}>Copilot settings</Sidebar.SubItem>}
          {isAgentTasksEnabled && <Sidebar.SubItem to={`${base}/agent-task-tokens`}>Model tokens</Sidebar.SubItem>}
          {isAgentTasksEnabled && <Sidebar.SubItem to={`${base}/mcp-servers`}>MCP servers</Sidebar.SubItem>}
        </Sidebar.Group>
      )}
    </Sidebar.Root>
  )
}

/**
 * The Agent Tasks flag also covers personal model tokens and MCPs for organization members.
 */
export function AgentTasksGate({ children }: { children: ReactNode }) {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const flag = useFeatureFlagEnabled(AGENT_TASKS_FLAG)
  useEffect(() => {
    if (flag === false) {
      navigate({
        to: '/organization/$organizationId/agent-experience/skill-presets',
        params: { organizationId },
        replace: true,
      })
    }
  }, [flag, navigate, organizationId])
  return flag ? children : null
}
