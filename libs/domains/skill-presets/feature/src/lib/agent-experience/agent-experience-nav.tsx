import { useLocation, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'

/**
 * The side list of Agents. It starts with the Skills registry; the next parts of this work add
 * Activity, Automate and Settings.
 */
export function AgentExperienceNav() {
  const { organizationId = '' } = useParams({ strict: false })
  const base = `/organization/${organizationId}/agent-experience`
  const { pathname } = useLocation()
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const registryPath = `${base}/skill-presets`
  const sections = [
    { title: 'Presets', to: registryPath },
    { title: 'Assignments', to: `${registryPath}/assignments` },
    { title: 'Skill loads', to: `${registryPath}/loads` },
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
    </Sidebar.Root>
  )
}
