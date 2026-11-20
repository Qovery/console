import { useLocation, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'

/**
 * The side list of Agents. It starts with the Skills registry, one page; the next parts of this work
 * add Automate, Activity and Settings.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const registryPath = `${base}/skill-presets`
  const isRegistryPage = pathname === registryPath || pathname.startsWith(`${registryPath}/`)

  return (
    <Sidebar.Root className="mt-6" aria-label="Agents">
      <Sidebar.Item to={registryPath} icon="sliders" iconStyle="regular" active={isRegistryPage}>
        Skills registry
      </Sidebar.Item>
    </Sidebar.Root>
  )
}
