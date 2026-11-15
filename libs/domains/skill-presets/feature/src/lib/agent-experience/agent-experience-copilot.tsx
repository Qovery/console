import { useParams } from '@tanstack/react-router'
import { type Organization } from 'qovery-typescript-axios'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { AICopilotSettings } from '@qovery/shared/devops-copilot/feature'
import { Badge, Button, Callout, Heading, Icon, Section, Skeleton, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { AgentExperiencePage } from './ui/agent-experience-ui'

const COPILOT_DOES = [
  { icon: 'comments', text: 'Answers questions about your services, deployments and clusters, right in the Console.' },
  { icon: 'stethoscope', text: 'Troubleshoots a failed deployment from its logs and events.' },
  { icon: 'bolt', text: 'Takes actions such as deploys and restarts, only when you allow read-write mode.' },
  { icon: 'clock', text: 'Runs the scheduled tasks you set up.' },
] as const

export function OnOffBadge({ on, label }: { on: boolean; label?: string }) {
  return on ? (
    <Badge variant="surface" color="green" className="gap-1 whitespace-nowrap">
      <Icon iconName="circle-check" iconStyle="regular" aria-hidden="true" />
      {label ?? 'On'}
    </Badge>
  ) : (
    <Badge variant="outline" color="neutral" className="gap-1">
      <Icon iconName="circle" iconStyle="regular" aria-hidden="true" />
      Off
    </Badge>
  )
}

/** "AI on, Copilot read-only", "AI features on, Copilot off", "Off"... */
export function aiStatusLabel(aiFeaturesEnabled: boolean, copilotEnabled: boolean, readOnly: boolean) {
  if (aiFeaturesEnabled && copilotEnabled) return `AI on, Copilot ${readOnly ? 'read-only' : 'read-write'}`
  if (aiFeaturesEnabled) return 'AI features on, Copilot off'
  if (copilotEnabled) return 'AI features off, Copilot on'
  return 'Off'
}

/** "On, read-only", "On, read-write" or "Off". */
export const copilotStateLabel = (enabled: boolean, readOnly: boolean) =>
  enabled ? `On, ${readOnly ? 'read-only' : 'read-write'}` : 'Off'

/**
 * The Copilot, inside Agent Experience. "Turn on AI" turns on both existing switches at once: the
 * organization's AI features (`ai_features_enabled`) and the Copilot (the DevOps Copilot service's
 * organization config). Turning off stays in the Copilot settings and only turns the Copilot off.
 * Members see the state, read-only.
 */
export function AgentExperienceCopilot() {
  const { organizationId = '' } = useParams({ strict: false })
  const isMock = getSkillPresetsMockScenario() !== null
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const copilot = useCopilotStatus({ organizationId })
  const aiOn = aiFeaturesEnabled && copilot.enabled
  const { data: organizationData } = useOrganization({ organizationId, enabled: !isMock })
  // The mock never reads the real organization.
  const organization: Organization | undefined = isMock
    ? ({ id: organizationId, name: 'Acme (mock)' } as Organization)
    : organizationData
  const { openModal, closeModal } = useModal()
  useDocumentTitle('Copilot - Agent Experience')

  return (
    <AgentExperiencePage
      title="Copilot"
      description="Qovery’s AI assistant in the Console. It works on your infrastructure with what you allow it to do."
    >
      <div className="flex max-w-content-with-navigation-left flex-col gap-6">
        <Section aria-labelledby="copilot-does" className="flex flex-col gap-3 rounded-md border border-neutral p-4">
          <Heading level={2} id="copilot-does">
            What the Copilot does
          </Heading>
          <ul className="grid grid-cols-1 gap-3 text-sm text-neutral md:grid-cols-2">
            {COPILOT_DOES.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <Icon iconName={icon} iconStyle="regular" className="mt-0.5 text-brand" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </Section>

        <div
          className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral px-4 py-3"
          data-testid="copilot-state"
        >
          <span className="flex flex-col">
            <span className="text-sm font-medium text-neutral">Status</span>
            <span className="text-xs text-neutral-subtle">AI features and the Copilot</span>
          </span>
          {copilot.isLoading ? (
            <Skeleton width={160} height={20} show />
          ) : (
            <OnOffBadge on={aiOn} label={aiStatusLabel(aiFeaturesEnabled, copilot.enabled, copilot.readOnly)} />
          )}
        </div>

        {isRoleLoading ? (
          <Skeleton height={160} className="w-full" show />
        ) : !canManage ? (
          <Callout.Root color="neutral" data-testid="copilot-member-note">
            <Callout.Icon>
              <Icon iconName="lock-keyhole" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextDescription>
                Only your organization’s owners and admins turn AI and the Copilot on or off.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        ) : (
          <>
            {!copilot.isLoading && !aiOn && (
              <Section
                aria-labelledby="copilot-turn-on"
                className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <Heading level={2} id="copilot-turn-on">
                    {TURN_ON_AI_LABEL}
                  </Heading>
                  <p className="text-sm text-neutral-subtle">
                    One step turns on AI features and the Copilot. The Copilot starts read-only, and you can change it
                    here afterwards.
                  </p>
                </div>
                <Button
                  type="button"
                  size="md"
                  onClick={() =>
                    openModal({ content: <TurnOnAiModal organizationId={organizationId} onClose={closeModal} /> })
                  }
                >
                  {TURN_ON_AI_LABEL}
                </Button>
              </Section>
            )}
            {copilot.enabled && organization && copilot.ready && (
              // The existing Copilot settings: access source, access mode, scheduled tasks, and turning it off.
              <AICopilotSettings organization={organization} embedded />
            )}
          </>
        )}
      </div>
    </AgentExperiencePage>
  )
}
