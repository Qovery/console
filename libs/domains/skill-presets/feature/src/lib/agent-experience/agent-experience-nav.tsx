import { useLocation, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

/**
 * The side list of Agent Experience. Policy tokens are for owners and admins only: members do not
 * get the entry.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()

  return (
    <Sidebar.Root className="mt-6" aria-label="Agent Experience">
      <Sidebar.Item to={base} icon="table-layout" iconStyle="regular" active={pathname.replace(/\/$/, '') === base}>
        Overview
      </Sidebar.Item>
      <Sidebar.Item to={`${base}/automate`} icon="stairs" iconStyle="regular">
        Automate
      </Sidebar.Item>
      <Sidebar.Item to={`${base}/copilot`} icon="message-bot" iconStyle="regular">
        Copilot
      </Sidebar.Item>
      <Sidebar.Item to={`${base}/connect`} icon="plug" iconStyle="regular">
        Connect your agent
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
      <Sidebar.Item to={`${base}/agent-activity`} icon="wave-pulse" iconStyle="regular">
        Activity
      </Sidebar.Item>
    </Sidebar.Root>
  )
}
