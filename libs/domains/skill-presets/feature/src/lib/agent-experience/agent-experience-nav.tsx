import { useLocation, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Sidebar } from '@qovery/shared/ui'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

// Entries nested in a group: indented like a sub-entry, with their icon.
const NESTED_ITEM = 'pl-[39px]'
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
 * The side list of Agents: the Skills Registry and Activity, then Settings with policy tokens, for
 * owners and admins only. Settings opens by itself on its pages.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const isAdmin = !isLoading && canManage

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      <Sidebar.Item
        to={`${base}/skill-presets`}
        icon="sliders"
        iconStyle="regular"
        active={pathname.startsWith(`${base}/skill-presets`)}
      >
        Skills Registry
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
          className="mt-4"
          defaultOpen={pathname.startsWith(`${base}/policy-tokens`)}
        >
          <Sidebar.Item to={`${base}/policy-tokens`} icon="key" iconStyle="regular" className={NESTED_ITEM}>
            Policy tokens
          </Sidebar.Item>
        </Sidebar.Group>
      )}
    </Sidebar.Root>
  )
}
