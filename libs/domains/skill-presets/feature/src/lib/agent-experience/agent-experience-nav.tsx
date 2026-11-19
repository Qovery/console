import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode, useEffect, useMemo } from 'react'
import { Sidebar } from '@qovery/shared/ui'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

const AGENT_TASKS_FLAG = 'argentic-workflow'
// Entries nested in a group: indented like a sub-entry, with their icon.
const NESTED_ITEM = 'pl-[41.5px]'
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
 * The side list of Agents: the Skills Registry, Connect, Automate with Optimize builds under it, and
 * Activity, then Settings. Settings holds policy tokens, the Copilot and, behind their flag, the Agent
 * Tasks pages; it is for owners and admins only, and opens by itself on its pages.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const isAgentTasksEnabled = Boolean(useFeatureFlagEnabled(AGENT_TASKS_FLAG))
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const registryPath = `${base}/skill-presets`
  const sections = [
    { title: 'Presets', to: registryPath },
    { title: 'Assignments', to: `${registryPath}/assignments` },
    { title: 'Skill loads', to: `${registryPath}/loads` },
    { title: 'Usage', to: `${registryPath}/usage` },
  ]
  const activeSection = sections.slice(1).find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
  const isRegistryPage = pathname === registryPath || pathname.startsWith(`${registryPath}/`)

  const isAdmin = !isLoading && canManage
  const settingsPaths = [`${base}/policy-tokens`, `${base}/copilot`, `${base}/agent-task-tokens`, `${base}/mcp-servers`]

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      {!isLoading && canManage ? (
        <Sidebar.Group title="Skills registry" icon="sliders" iconStyle="regular" defaultOpen={isRegistryPage}>
          {sections.map(({ title, to }) => (
            <Sidebar.SubItem key={to} to={to} active={isRegistryPage && (activeSection?.to ?? registryPath) === to}>
              {title}
            </Sidebar.SubItem>
          ))}
        </Sidebar.Group>
      ) : (
        <Sidebar.Item to={registryPath} icon="sliders" iconStyle="regular" active={isRegistryPage}>
          Skills registry
        </Sidebar.Item>
      )}
      <Sidebar.Item to={`${base}/connect`} icon="plug" iconStyle="regular">
        Connect
      </Sidebar.Item>
      <Sidebar.Item to={`${base}/automate`} icon="stairs" iconStyle="regular">
        Automate
      </Sidebar.Item>
      {/* Under Automate: indented like a sub-entry, with the icon of its page. */}
      <Sidebar.Item to={`${base}/build-optimizer`} icon="gauge-high" iconStyle="regular" className={NESTED_ITEM}>
        Optimize builds
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
      {isAdmin && (
        <Sidebar.Group
          title="Settings"
          icon="gear"
          iconStyle="regular"
          defaultOpen={settingsPaths.some((path) => pathname.startsWith(path))}
        >
          <Sidebar.SubItem to={`${base}/policy-tokens`}>Policy tokens</Sidebar.SubItem>
          <Sidebar.Item to={`${base}/copilot`} icon="message-bot" iconStyle="regular" className={NESTED_ITEM}>
            Copilot settings
          </Sidebar.Item>
          {isAgentTasksEnabled && (
            <Sidebar.Item to={`${base}/agent-task-tokens`} icon="robot" iconStyle="regular" className={NESTED_ITEM}>
              Model tokens
            </Sidebar.Item>
          )}
          {isAgentTasksEnabled && (
            <Sidebar.Item to={`${base}/mcp-servers`} icon="plug" iconStyle="regular" className={NESTED_ITEM}>
              MCP servers
            </Sidebar.Item>
          )}
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
