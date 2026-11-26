import { useEffect, useState } from 'react'
import type { EmailPreferences, PricingClient } from '@qovery/shared/billing/data-access'
import { Button, Callout, Heading, Icon, InputToggle, Skeleton } from '@qovery/shared/ui'
import { errorText } from '../components/parts'

/** The person's email preferences for this organization (billing emails cannot be turned off). */
export function EmailPreferencesPanel({ organizationId, client }: { organizationId: string; client: PricingClient }) {
  return <OrganizationEmailPreferences key={organizationId} organizationId={organizationId} client={client} />
}

function OrganizationEmailPreferences({ organizationId, client }: { organizationId: string; client: PricingClient }) {
  const [p, setP] = useState<EmailPreferences>()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const retry = () => setAttempt((n) => n + 1)

  useEffect(() => {
    let live = true
    setError('')
    client
      .emailPreferences?.(organizationId)
      .then((value) => live && setP(value))
      .catch((e) => live && setError(errorText(e)))
    return () => {
      live = false
    }
  }, [client, organizationId, attempt])

  async function save(category: string, enabled: boolean) {
    if (!client.setEmailPreference || saving) return
    setSaving(true)
    setError('')
    try {
      setP(await client.setEmailPreference(organizationId, category, enabled))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setSaving(false)
    }
  }
  if (!client.emailPreferences) return null
  const loadError = error && (
    <Callout.Root color="red" role="alert">
      <Callout.Icon>
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>
          {p ? 'Preference could not be saved' : 'Email preferences could not be loaded'}
        </Callout.TextHeading>
        <Callout.TextDescription>{error}</Callout.TextDescription>
      </Callout.Text>
      {p ? (
        <Button size="sm" variant="outline" color="neutral" onClick={() => setError('')}>
          Dismiss
        </Button>
      ) : (
        <Button size="sm" variant="outline" color="neutral" onClick={retry}>
          Retry
        </Button>
      )}
    </Callout.Root>
  )
  if (!p) {
    return (
      loadError || (
        <div role="status" className="flex flex-col gap-4 rounded border border-neutral bg-surface-neutral p-4">
          <span className="sr-only">Loading email preferences</span>
          <Skeleton width={128} height={16} />
          <Skeleton width="70%" height={16} />
          <Skeleton width="55%" height={16} />
        </div>
      )
    )
  }
  return (
    <div className="rounded border border-neutral bg-surface-neutral">
      <div className="border-b border-neutral px-4 py-3">
        <Heading level={2}>Email preferences</Heading>
        <p className="text-sm text-neutral-subtle [overflow-wrap:anywhere]">Notifications are sent to {p.email}.</p>
      </div>
      {loadError && <div className="px-4 py-3">{loadError}</div>}
      <div className="divide-y divide-neutral">
        {p.categories.map((c) => (
          <div key={c.category} className="px-4 py-3">
            <InputToggle
              small
              value={c.enabled}
              disabled={c.locked || saving || !client.setEmailPreference}
              title={c.name}
              description={c.description}
              onChange={(v) => save(c.category, v)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/** A row that opens the person's email preferences on the host's own page (the console's Settings → Notifications). */
export function EmailPreferencesLink({ onConfigure }: { onConfigure: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-neutral bg-surface-neutral px-4 py-3">
      <div>
        <Heading level={2} className="text-sm">
          Email notifications
        </Heading>
        <p className="text-sm text-neutral-subtle">Choose which billing emails you receive.</p>
      </div>
      <Button size="md" variant="outline" color="neutral" onClick={onConfigure}>
        Configure
      </Button>
    </div>
  )
}
