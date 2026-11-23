import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { Button, Callout, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useRbacPrototype } from './rbac-v2-prototype-context'

const PROVIDERS: { id: string; name: string; icon: IconName; iconStyle?: 'brands' }[] = [
  { id: 'okta', name: 'Okta', icon: 'shield-halved' },
  { id: 'entra', name: 'Microsoft Entra ID', icon: 'microsoft', iconStyle: 'brands' },
  { id: 'google', name: 'Google Workspace', icon: 'google', iconStyle: 'brands' },
  { id: 'saml', name: 'Other SAML or OIDC provider', icon: 'key' },
]

const BENEFITS = [
  'Members sign in with SSO and are added automatically',
  'Their roles follow the groups they belong to in the IdP',
  'Removing someone from the IdP removes their access in Qovery',
]

// Opens in a modal, which renders outside the prototype provider: it gets its callbacks as props
function ConnectIdpModal({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }) {
  const [provider, setProvider] = useState(PROVIDERS[0].id)

  return (
    <Section className="p-6">
      <Heading className="mb-2 text-2xl text-neutral">Connect an identity provider</Heading>
      <p className="mb-5 text-sm text-neutral-subtle">
        Manage who can access Qovery, and with which roles, from the tool you already use for your team.
      </p>
      <ul className="mb-5 flex flex-col gap-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-neutral">
            <Icon iconName="check" className="mt-0.5 text-positive" />
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mb-2 text-sm font-medium text-neutral">Provider</p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {PROVIDERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={provider === item.id}
            onClick={() => setProvider(item.id)}
            className={twMerge(
              'flex items-center gap-2 rounded border border-neutral px-3 py-2.5 text-left text-sm text-neutral hover:bg-surface-neutral-subtle',
              provider === item.id && 'border-brand-strong bg-surface-brand-subtle hover:bg-surface-brand-subtle'
            )}
          >
            <Icon iconName={item.icon} iconStyle={item.iconStyle ?? 'regular'} className="text-neutral-subtle" />
            {item.name}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" size="lg" variant="plain" color="neutral" onClick={onClose}>
          Not now
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            onConnect()
            onClose()
          }}
        >
          Connect {PROVIDERS.find((item) => item.id === provider)?.name}
        </Button>
      </div>
    </Section>
  )
}

// In the target solution, the IdP is set up on its own settings page; before, a lightweight modal
export function useOpenConnectIdp() {
  const { setHasIdp, hasGroups } = useRbacPrototype()
  const { openModal, closeModal } = useModal()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams({ strict: false })

  return () =>
    hasGroups
      ? navigate({ to: '/organization/$organizationId/settings/identity-provider', params: { organizationId } })
      : openModal({ content: <ConnectIdpModal onClose={closeModal} onConnect={() => setHasIdp(true)} /> })
}

// Shown on the members page while no IdP is connected, with the number of role assignments managed by hand
export function IdpNudge({ manualAssignments }: { manualAssignments: number }) {
  const { hasIdp } = useRbacPrototype()
  const openConnectIdp = useOpenConnectIdp()
  const [dismissed, setDismissed] = useState(false)

  if (hasIdp || dismissed) return null

  return (
    <Callout.Root color="sky" className="mb-6">
      <Callout.Icon>
        <Icon iconName="id-badge" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>Manage access from your identity provider</Callout.TextHeading>
        <Callout.TextDescription>
          You manage {manualAssignments} role assignments by hand. Connect Okta, Microsoft Entra ID or Google Workspace:
          new members get their roles from their groups, and people removed from the IdP lose access right away.
        </Callout.TextDescription>
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" onClick={openConnectIdp}>
            Connect an IdP
          </Button>
          <Button type="button" size="sm" variant="plain" color="neutral" onClick={() => setDismissed(true)}>
            Not now
          </Button>
        </div>
      </Callout.Text>
    </Callout.Root>
  )
}
