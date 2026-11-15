import { useNavigate, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/data-access'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Navbar, Section } from '@qovery/shared/ui'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { MemberAgentView } from '../member-agent-view/member-agent-view'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'

export type SkillPresetsTab = 'presets' | 'assignments' | 'loads' | 'usage'

export interface SkillPresetsLayoutProps {
  activeTab: SkillPresetsTab
  children: ReactNode
}

export function SkillPresetsLayout({ activeTab, children }: SkillPresetsLayoutProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { error, isLoading } = useSkillPresets({ organizationId })
  const basePath = `/organization/${organizationId}/settings/skill-presets`
  const isMember = getSkillPresetErrorStatus(error) === 403
  // Only admins can create presets: wait until the list tells whether this user is one.
  const canCreate = !isLoading && !isMember

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Skill presets"
        description="Decide how your members’ coding agents use Qovery: which Qovery skills they load, your team’s instructions on top, and skills of your own. Every save is checked for unsafe content and recorded in the audit logs."
      >
        {canCreate && (
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
        {isMember ? (
          <MemberAgentView organizationId={organizationId} />
        ) : (
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
        )}
      </div>
    </Section>
  )
}
