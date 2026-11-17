import { useNavigate, useParams } from '@tanstack/react-router'
import { type ReactElement, type ReactNode } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Navbar, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { AI_FEATURES_OFF_TOOLTIP, AiFeaturesNotice } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { MemberAgentView } from '../member-agent-view/member-agent-view'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'

export type SkillPresetsTab = 'presets' | 'assignments' | 'preview' | 'loads' | 'usage'

export interface SkillPresetsLayoutProps {
  activeTab: SkillPresetsTab
  children: ReactNode
}

const ADMIN_DESCRIPTION =
  'Your organization’s skills: which Qovery skills agents load, your team’s rules and your own skills, as presets assigned to teams and people.'
const MEMBER_DESCRIPTION = 'What your coding agent receives from Qovery, readable in full.'

function AccessSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading the Skills Registry">
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
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const basePath = `/organization/${organizationId}/agent-experience/skill-presets`

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Skills Registry"
        description={isLoading ? undefined : canManage ? ADMIN_DESCRIPTION : MEMBER_DESCRIPTION}
      >
        {!isLoading && canManage && (
          <Tooltip content={AI_FEATURES_OFF_TOOLTIP} disabled={aiFeaturesEnabled}>
            {/* A disabled button gets no pointer or focus events: the wrapper carries the tooltip. */}
            <span tabIndex={aiFeaturesEnabled ? undefined : 0} className="inline-flex">
              <Button
                size="md"
                disabled={!aiFeaturesEnabled}
                onClick={() =>
                  navigate({
                    to: '/organization/$organizationId/agent-experience/skill-presets/new',
                    params: { organizationId },
                  })
                }
              >
                <Icon iconName="circle-plus" iconStyle="regular" />
                Create preset
              </Button>
            </span>
          </Tooltip>
        )}
      </SettingsHeading>
      <div className="flex flex-col gap-6">
        <MockScenarioBanner />
        {!isLoading && canManage && !aiFeaturesEnabled && (
          <AiFeaturesNotice organizationId={organizationId} canEnable={canManage} />
        )}
        {isLoading ? (
          <AccessSkeleton />
        ) : canManage ? (
          <>
            <Navbar.Root activeId={activeTab} ariaLabel="Skills Registry sections" className="border-b border-neutral">
              <Navbar.Item id="presets" to={basePath}>
                Presets
              </Navbar.Item>
              <Navbar.Item id="assignments" to={`${basePath}/assignments`}>
                Assignments
              </Navbar.Item>
              <Navbar.Item id="preview" to={`${basePath}/preview`}>
                Preview
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
