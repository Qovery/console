import { useLocation, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Sidebar } from '@qovery/shared/ui'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

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
 * The side list of Agents. It groups Skills registry pages alongside Activity and Settings.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const registryPath = `${base}/skill-presets`
  const sections = [
    { title: 'Presets', to: registryPath },
    { title: 'Assignments', to: `${registryPath}/assignments` },
    { title: 'Skill loads', to: `${registryPath}/loads` },
    { title: 'Usage', to: `${registryPath}/usage` },
  ]
  const activeSection = sections.slice(1).find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
  const isRegistryPage = pathname === registryPath || pathname.startsWith(`${registryPath}/`)

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
      <Sidebar.Item
        to={`${base}/agent-activity`}
        icon="wave-pulse"
        iconStyle="regular"
        badge={denied > 0 ? String(denied) : undefined}
        aria-label={denied > 0 ? `Activity, ${denied} denied actions in the last 7 days` : undefined}
      >
        Activity
      </Sidebar.Item>
      {!isLoading && canManage && (
        <Sidebar.Group
          title="Settings"
          icon="gear"
          iconStyle="regular"
          defaultOpen={pathname.startsWith(`${base}/policy-tokens`)}
        >
          <Sidebar.SubItem to={`${base}/policy-tokens`}>Policy tokens</Sidebar.SubItem>
        </Sidebar.Group>
      )}
    </Sidebar.Root>
  )
}
