import { useParams } from '@tanstack/react-router'
import { type Organization } from 'qovery-typescript-axios'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { AICopilotSettings } from '@qovery/shared/devops-copilot/feature'
import { Badge, Button, Callout, Heading, Icon, Section, Skeleton, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TurnOnAiFeaturesModal } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'

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

/** "On, read-only", "On, read-write" or "Off". */
export const copilotStateLabel = (enabled: boolean, readOnly: boolean) =>
  enabled ? `On, ${readOnly ? 'read-only' : 'read-write'}` : 'Off'

/**
 * The Copilot, inside Agent Experience. It needs two switches, both owners and admins only: the
 * organization's AI features (`ai_features_enabled`), then the Copilot itself (the DevOps Copilot
 * service's organization config). Members see the state, read-only.
 */
export function AgentExperienceCopilot() {
  const { organizationId = '' } = useParams({ strict: false })
  const isMock = getSkillPresetsMockScenario() !== null
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const copilot = useCopilotStatus({ organizationId })
  const { data: organizationData } = useOrganization({ organizationId, enabled: !isMock })
  // The mock never reads the real organization.
  const organization: Organization | undefined = isMock
    ? ({ id: organizationId, name: 'Acme (mock)' } as Organization)
    : organizationData
  const { openModal, closeModal } = useModal()
  useDocumentTitle('Copilot - Agent Experience')

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Copilot"
        description="Qovery’s AI assistant in the Console. It works on your infrastructure with what you allow it to do."
      />
      <div className="flex max-w-content-with-navigation-left flex-col gap-6">
        <MockScenarioBanner />

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

        <dl
          className="grid grid-cols-1 divide-y divide-neutral rounded-md border border-neutral md:grid-cols-2 md:divide-x md:divide-y-0"
          data-testid="copilot-state"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="flex flex-col">
              <span className="text-sm font-medium text-neutral">AI features</span>
              <span className="text-xs text-neutral-subtle">The organization’s opt-in to AI, Copilot included</span>
            </dt>
            <dd>
              <OnOffBadge on={aiFeaturesEnabled} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="flex flex-col">
              <span className="text-sm font-medium text-neutral">Copilot</span>
              <span className="text-xs text-neutral-subtle">Its own switch, with its terms and modes</span>
            </dt>
            <dd>
              {copilot.isLoading ? (
                <Skeleton width={64} height={20} show />
              ) : (
                <OnOffBadge on={copilot.enabled} label={copilotStateLabel(copilot.enabled, copilot.readOnly)} />
              )}
            </dd>
          </div>
        </dl>

        {isRoleLoading ? (
          <Skeleton height={160} className="w-full" show />
        ) : !canManage ? (
          <Callout.Root color="neutral" data-testid="copilot-member-note">
            <Callout.Icon>
              <Icon iconName="lock-keyhole" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextDescription>
                Only your organization’s owners and admins turn AI features and the Copilot on or off.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        ) : !aiFeaturesEnabled ? (
          <Section
            aria-labelledby="copilot-ai-off"
            className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral p-4"
          >
            <div className="flex flex-col gap-0.5">
              <Heading level={2} id="copilot-ai-off">
                Turn on AI features first
              </Heading>
              <p className="text-sm text-neutral-subtle">
                The Copilot is one of the organization’s AI features. Once they are on, you can turn the Copilot on
                here.
              </p>
            </div>
            <Button
              type="button"
              size="md"
              onClick={() =>
                openModal({ content: <TurnOnAiFeaturesModal organizationId={organizationId} onClose={closeModal} /> })
              }
            >
              Turn on AI features
            </Button>
          </Section>
        ) : !organization || !copilot.ready ? (
          <Skeleton height={160} className="w-full" show />
        ) : (
          // The existing Copilot settings: terms and opt-in, mode, token mode, scheduled tasks, turn off.
          <AICopilotSettings organization={organization} embedded />
        )}
      </div>
    </Section>
  )
}
