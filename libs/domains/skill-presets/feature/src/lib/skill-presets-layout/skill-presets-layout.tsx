import { useNavigate, useParams } from '@tanstack/react-router'
import { type ReactElement, type ReactNode } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Navbar, Section, Skeleton } from '@qovery/shared/ui'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { MemberAgentView } from '../member-agent-view/member-agent-view'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'

export type SkillPresetsTab = 'presets' | 'assignments' | 'loads' | 'usage'

export interface SkillPresetsLayoutProps {
  activeTab: SkillPresetsTab
  children: ReactNode
}

const ADMIN_DESCRIPTION =
  'Decide how your members’ coding agents use Qovery: which Qovery skills they load, your team’s instructions on top, and skills of your own. Every save is checked for unsafe content and recorded in the audit logs.'
const MEMBER_DESCRIPTION =
  'What your coding agent receives from Qovery: the skills it can load and your team’s instructions, readable in full.'

function AccessSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading skill presets">
      <Skeleton width={320} height={16} show />
      <Skeleton height={200} className="w-full" show />
    </div>
  )
}

/**
 * The page frame. Owners and admins get the tabs and the admin pages; anyone else gets the read-only
 * view of what their agent receives. The role is known before anything renders, so admin controls
 * never flash for members, and admin pages never mount for them (their queries never run).
 */
export function SkillPresetsLayout({ activeTab, children }: SkillPresetsLayoutProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const basePath = `/organization/${organizationId}/settings/skill-presets`

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Skill presets"
        description={isLoading ? undefined : canManage ? ADMIN_DESCRIPTION : MEMBER_DESCRIPTION}
      >
        {!isLoading && canManage && (
          <Button
            size="md"
            onClick={() =>
              navigate({ to: '/organization/$organizationId/settings/skill-presets/new', params: { organizationId } })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Create preset
          </Button>
        )}
      </SettingsHeading>
      <div className="flex flex-col gap-6">
        <MockScenarioBanner />
        {isLoading ? (
          <AccessSkeleton />
        ) : canManage ? (
          <>
            <Navbar.Root activeId={activeTab} ariaLabel="Skill presets sections" className="border-b border-neutral">
              <Navbar.Item id="presets" to={basePath}>
                Presets
              </Navbar.Item>
              <Navbar.Item id="assignments" to={`${basePath}/assignments`}>
                Assignments
              </Navbar.Item>
              <Navbar.Item id="loads" to={`${basePath}/loads`}>
                Skill loads
              </Navbar.Item>
              <Navbar.Item id="usage" to={`${basePath}/usage`}>
                Usage
              </Navbar.Item>
            </Navbar.Root>
            {children}
          </>
        ) : (
          <MemberAgentView organizationId={organizationId} />
        )}
      </div>
    </Section>
  )
}

/**
 * For the full-page admin routes (editor, history, create): owners and admins see the page, anyone
 * else the read-only view, as if they had opened the presets page.
 */
export function SkillPresetsAdminOnly({ children }: { children: ReactElement }) {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  if (!isLoading && canManage) return children
  return <SkillPresetsLayout activeTab="presets">{null}</SkillPresetsLayout>
}
