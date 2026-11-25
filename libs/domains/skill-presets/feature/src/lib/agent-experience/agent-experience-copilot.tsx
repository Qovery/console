import { useParams } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { AICopilotSettings } from '@qovery/shared/devops-copilot/feature'
import { Badge, Button, Callout, Heading, Icon, Section, Skeleton, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { LoadError } from '../load-error/load-error'
import { AgentExperiencePage } from './ui/agent-experience-ui'

export function OnOffBadge({ on, label }: { on: boolean; label?: string }) {
  return on ? (
    <Badge variant="surface" color="green" className="gap-1 whitespace-nowrap font-medium">
      <Icon iconName="circle-check" iconStyle="regular" aria-hidden="true" />
      {label ?? 'On'}
    </Badge>
  ) : (
    <Badge variant="outline" color="neutral" className="gap-1 font-medium">
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
  const {
    data: organization,
    isLoading: isOrganizationLoading,
    error: organizationError,
    refetch: refetchOrganization,
  } = useOrganization({ organizationId, enabled: Boolean(organizationId) })
  const copilot = useCopilotStatus({ organizationId })
  const aiFeaturesEnabled = organization ? organization.ai_features_enabled !== false : undefined
  const aiOn = aiFeaturesEnabled === true && copilot.enabled
  const hasKnownStatus = aiFeaturesEnabled !== undefined && copilot.hasConfig
  const isStatusUnavailable = (organizationError && !organization) || (copilot.error && !copilot.hasConfig)
  const isStatusLoading = !isStatusUnavailable && (isOrganizationLoading || copilot.isLoading)
  const turnOnDescription = copilot.enabled
    ? 'The Copilot is already on. This turns on AI features for your organization.'
    : aiFeaturesEnabled
      ? 'AI features are already on. This turns on the Copilot in read-only mode. You can change its mode here afterwards.'
      : 'This turns on AI features and the Copilot. The Copilot starts in read-only mode. You can change its mode here afterwards.'
  const { openModal, closeModal } = useModal()
  useDocumentTitle('Copilot - Agents')

  return (
    <AgentExperiencePage
      title="Copilot"
      titleBadge={
        <Badge variant="surface" color="brand" size="sm" className="font-medium">
          Preview
        </Badge>
      }
      description="Qovery’s AI assistant in the Console, limited to what you allow."
      width="reading"
      // What the Copilot does lives in the docs, behind the header's help button, as on other settings pages.
      showHelp
    >
      <div className="flex flex-col gap-6">
        <Section
          aria-labelledby="copilot-status"
          className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral bg-surface-neutral px-4 py-3"
          data-testid="copilot-state"
        >
          <div className="flex flex-col">
            <Heading id="copilot-status" className="text-sm">
              Status
            </Heading>
            <p className="text-sm text-neutral-subtle">AI features and the Copilot</p>
          </div>
          {isStatusLoading ? (
            <Skeleton width={160} height={20} show />
          ) : !hasKnownStatus ? (
            <Badge variant="outline" color="neutral" className="gap-1 font-medium">
              <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
              Unknown
            </Badge>
          ) : (
            <OnOffBadge on={aiOn} label={aiStatusLabel(aiFeaturesEnabled, copilot.enabled, copilot.readOnly)} />
          )}
        </Section>

        {organizationError ? (
          <LoadError
            title={
              organization ? 'Unable to refresh the AI features status.' : 'Unable to load the AI features status.'
            }
            error={organizationError}
            onRetry={() => refetchOrganization()}
          />
        ) : null}
        {copilot.error ? (
          <div data-testid="copilot-error">
            <LoadError
              title={copilot.hasConfig ? 'Unable to refresh the Copilot status.' : 'Unable to load the Copilot status.'}
              error={copilot.error}
              onRetry={() => copilot.refetch()}
            />
          </div>
        ) : null}

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
            {hasKnownStatus && !organizationError && !copilot.error && !aiOn && (
              <Section
                aria-labelledby="copilot-turn-on"
                className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral bg-surface-neutral p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <Heading level={2} id="copilot-turn-on">
                    {TURN_ON_AI_LABEL}
                  </Heading>
                  <p className="text-sm text-neutral-subtle">{turnOnDescription}</p>
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
            {copilot.hasConfig && copilot.enabled && organization && (
              // The existing Copilot settings: access source, access mode, scheduled tasks, and turning it off.
              <AICopilotSettings organization={organization} embedded />
            )}
          </>
        )}
      </div>
    </AgentExperiencePage>
  )
}
