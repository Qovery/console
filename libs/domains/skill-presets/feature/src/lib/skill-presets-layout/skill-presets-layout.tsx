import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type ReactElement, type ReactNode, useEffect } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Section, Skeleton, Tooltip, useModal } from '@qovery/shared/ui'
import { ConnectAgentModal } from '../agent-experience/connect-agent-modal'
import { AI_FEATURES_OFF_TOOLTIP, AiFeaturesNotice } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { MemberAgentView } from '../member-agent-view/member-agent-view'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'

/** The Skills registry is one page. */
export type SkillPresetsTab = 'presets'

export interface SkillPresetsLayoutProps {
  activeTab: SkillPresetsTab
  children: ReactNode
}

const ADMIN_DESCRIPTION =
  'Your organization’s skills: which Qovery skills agents load, your team’s rules and your own skills, as presets assigned to teams and people.'
const MEMBER_DESCRIPTION = 'What your coding agent receives from Qovery, readable in full.'

function AccessSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" role="status" aria-label="Loading the Skills registry">
      <Skeleton width={320} height={16} show />
      <Skeleton height={200} className="w-full" show />
    </div>
  )
}

/**
 * Connecting is a one-time setup per machine: a popup, one click away from the registry. Old Connect
 * links land here with `?connect=true`, which opens it once.
 */
export function ConnectAgentButton() {
  const { organizationId = '' } = useParams({ strict: false })
  const connect = (useSearch({ strict: false }) as { connect?: boolean } | undefined)?.connect
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const open = () => openModal({ content: <ConnectAgentModal onClose={closeModal} />, options: { width: 676 } })

  useEffect(() => {
    if (!connect) return
    open()
    navigate({
      to: '/organization/$organizationId/agent-experience/skill-presets',
      params: { organizationId },
      search: {},
      replace: true,
    })
    // Once, when the page opens with the parameter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect])

  return (
    <Button type="button" size="md" variant="outline" color="neutral" className="gap-1.5" onClick={open}>
      <Icon iconName="plug" iconStyle="regular" />
      Connect an agent
    </Button>
  )
}

/**
 * The page frame. Owners and admins get the admin pages; anyone else gets the read-only
 * view of what their agent receives. The role is known before anything renders, so admin controls
 * never flash for members, and admin pages never mount for them (their queries never run).
 */
export function SkillPresetsLayout({ children }: SkillPresetsLayoutProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Skills registry"
        description={isLoading ? undefined : canManage ? ADMIN_DESCRIPTION : MEMBER_DESCRIPTION}
      >
        <div className="flex shrink-0 items-start gap-2">
          <ConnectAgentButton />
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
        </div>
      </SettingsHeading>
      <div className="flex flex-col gap-6">
        <MockScenarioBanner />
        {!isLoading && canManage && !aiFeaturesEnabled && (
          <AiFeaturesNotice organizationId={organizationId} canEnable={canManage} />
        )}
        {isLoading ? <AccessSkeleton /> : canManage ? children : <MemberAgentView organizationId={organizationId} />}
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
