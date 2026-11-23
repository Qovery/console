import { useParams } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { AICopilotSettings } from '@qovery/shared/devops-copilot/feature'
import { Badge, Button, Callout, Heading, Icon, Section, Skeleton, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { AgentExperiencePage } from './ui/agent-experience-ui'

export function OnOffBadge({ on, label }: { on: boolean; label?: string }) {
  return on ? (
    <Badge variant="surface" color="green" className="gap-1 whitespace-nowrap">
      <Icon iconName="circle-check" iconStyle="regular" aria-hidden="true" />
      {label ?? 'On'}
    </Badge>
  ) : (
    <Badge variant="outline" color="neutral" className="gap-1">
      <Icon iconName="circle" iconStyle="regular" aria-hidden="true" />
      {label ?? 'Off'}
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
 * The Copilot, inside Agents. "Turn on AI" turns on both existing switches at once: the
 * organization's AI features (`ai_features_enabled`) and the Copilot (the DevOps Copilot service's
 * organization config). Turning off stays in the Copilot settings and only turns the Copilot off.
 * Members see the state, read-only.
 */
export function AgentExperienceCopilot() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const copilot = useCopilotStatus({ organizationId })
  const aiOn = aiFeaturesEnabled && copilot.enabled
  const hasCopilotError = Boolean(copilot.error)
  const { data: organization } = useOrganization({ organizationId })
  const { openModal, closeModal } = useModal()
  useDocumentTitle('Copilot - Agents')

  return (
    <AgentExperiencePage
      title="Copilot"
      titleBadge={
        <Badge variant="surface" color="brand" size="sm">
          Preview
        </Badge>
      }
      description="Qovery’s AI assistant in the Console, limited to what you allow."
      width="reading"
      // What the Copilot does lives in the docs, behind the header's help button, as on other settings pages.
      showHelp
    >
      <div className="flex flex-col gap-6">
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
          ) : hasCopilotError ? (
            <Badge variant="outline" color="neutral" className="gap-1">
              <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
              Unknown
            </Badge>
          ) : (
            <OnOffBadge on={aiOn} label={aiStatusLabel(aiFeaturesEnabled, copilot.enabled, copilot.readOnly)} />
          )}
        </div>

        {/* A failed config read is not "off": say so, and offer no switch until it loads. */}
        {hasCopilotError && (
          <Callout.Root color="red" data-testid="copilot-error">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextDescription>
                Unable to load the Copilot status. Reload the page to try again.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}

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
            {!copilot.isLoading && !hasCopilotError && !aiOn && (
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
            {copilot.enabled && !hasCopilotError && organization && (
              // The existing Copilot settings: access source, access mode, scheduled tasks, and turning it off.
              <AICopilotSettings organization={organization} embedded />
            )}
          </>
        )}
      </div>
    </AgentExperiencePage>
  )
}
