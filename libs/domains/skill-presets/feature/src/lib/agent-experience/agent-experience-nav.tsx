import { useLocation, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'

/**
 * The side list of Agents. It starts with the Skills Registry; the next parts of this work add
 * Activity, Automate and Settings.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()

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
    </Sidebar.Root>
  )
}
