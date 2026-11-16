import { useParams } from '@tanstack/react-router'
import { Badge, Button, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

export const AGENT_EXPERIENCE_ENTRY_DISMISSED_KEY = 'agent-experience-entry-dismissed'

/**
 * The way in from the organization overview: a compact card, dismissible, that leads to Agent
 * Experience. Dismissed once per browser.
 */
export function AgentExperienceEntryCard() {
  const { organizationId = '' } = useParams({ strict: false })
  const [dismissed, setDismissed] = useLocalStorage(AGENT_EXPERIENCE_ENTRY_DISMISSED_KEY, false)
  if (dismissed) return null

  return (
    <Section
      aria-labelledby="agent-experience-entry"
      className="relative flex flex-col gap-3 rounded-md border border-neutral bg-surface-neutral p-4"
      data-testid="agent-experience-entry"
    >
      <Button
        type="button"
        variant="plain"
        color="neutral"
        size="xs"
        iconOnly
        aria-label="Dismiss"
        className="absolute right-2 top-2"
        onClick={() => setDismissed(true)}
      >
        <Icon iconName="xmark" iconStyle="regular" />
      </Button>
      <div className="flex items-center gap-2 pr-6">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-brand-subtle text-brand">
          <Icon iconName="robot" iconStyle="regular" />
        </span>
        <Heading level={2} id="agent-experience-entry" className="text-sm">
          Set up how coding agents work with Qovery
        </Heading>
        <Badge variant="surface" color="brand" size="sm">
          New
        </Badge>
      </div>
      <p className="text-sm text-neutral-subtle">
        Connect your agents, choose the skills they load, limit what they can do, and see what they did.
      </p>
      <Link
        as="button"
        to="/organization/$organizationId/agent-experience"
        params={{ organizationId }}
        size="md"
        variant="outline"
        color="neutral"
        className="w-fit gap-1.5"
      >
        Open Agents
        <Icon iconName="arrow-right" iconStyle="regular" />
      </Link>
    </Section>
  )
}
