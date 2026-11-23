import { useLocation, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'
import { activityWindowEnd } from '../agent-activity/activity-search'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManagePolicyTokens } from '../hooks/use-can-manage-policy-tokens/use-can-manage-policy-tokens'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

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
 * The side list of Agents: the Skills registry and Activity, then Settings with policy tokens, for
 * owners, admins and DevOps members.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const { canManage: canManageTokens, isLoading: isTokenRoleLoading } = useCanManagePolicyTokens({ organizationId })
  const denied = useDeniedThisWeek(organizationId, canManage ? 'organization' : 'me', !isLoading)
  const registryPath = `${base}/skill-presets`
  const isRegistryPage = pathname === registryPath || pathname.startsWith(`${registryPath}/`)

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      <Sidebar.Item to={registryPath} icon="sliders" iconStyle="regular" active={isRegistryPage}>
        Skills registry
      </Sidebar.Item>
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
      {!isTokenRoleLoading && canManageTokens && (
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
