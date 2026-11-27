import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BillingError, type PricingClient, billing } from '@qovery/shared/billing/data-access'
import { Button, Callout, Heading, Icon, InputToggle, Skeleton } from '@qovery/shared/ui'
import { errorText } from './parts'

/** The person's email preferences for this organization (billing emails cannot be turned off). */
export function EmailPreferencesPanel({ organizationId, client }: { organizationId: string; client: PricingClient }) {
  const { queryKey } = billing.emailPreferences({ client, organizationId })
  return <OrganizationEmailPreferences key={JSON.stringify(queryKey)} organizationId={organizationId} client={client} />
}

function OrganizationEmailPreferences({ organizationId, client }: { organizationId: string; client: PricingClient }) {
  const queryClient = useQueryClient()
  const options = billing.emailPreferences({ client, organizationId })
  const preferences = useQuery({
    ...options,
    enabled: Boolean(client.emailPreferences),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
  const mutation = useMutation({
    mutationFn: ({ category, enabled }: { category: string; enabled: boolean }) =>
      Promise.resolve(client.setEmailPreference?.(organizationId, category, enabled)),
    onSuccess: async (updated) => {
      if (!updated) return
      await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true })
      queryClient.setQueryData(options.queryKey, updated)
    },
  })
  const accessDenied = preferences.error instanceof BillingError && [401, 403].includes(preferences.error.status)
  const p = accessDenied ? undefined : preferences.data
  const loadFailure = preferences.isFetching ? null : preferences.error
  const failure = mutation.error ?? loadFailure
  const saveFailed = mutation.isError
  const error = failure ? errorText(failure) : ''
  if (!client.emailPreferences) return null
  const loadError = error && (
    <Callout.Root color="red" role="alert">
      <Callout.Icon>
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>
          {saveFailed ? 'Preference could not be saved' : 'Email preferences could not be loaded'}
        </Callout.TextHeading>
        <Callout.TextDescription>{error}</Callout.TextDescription>
      </Callout.Text>
      {saveFailed ? (
        <Button size="sm" variant="outline" color="neutral" onClick={() => mutation.reset()}>
          Dismiss
        </Button>
      ) : (
        <Button size="sm" variant="outline" color="neutral" onClick={() => preferences.refetch()}>
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
              disabled={
                c.locked || preferences.isFetching || !!loadFailure || mutation.isLoading || !client.setEmailPreference
              }
              title={c.name}
              description={c.description}
              onChange={(enabled) => mutation.mutate({ category: c.category, enabled })}
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
