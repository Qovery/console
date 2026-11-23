import { useState } from 'react'
import {
  Badge,
  Button,
  Callout,
  CopyToClipboardButtonIcon,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  SegmentedControl,
  Tooltip,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { Panel, groupIcon } from '../rbac-v2-ui'

// Target solution: the SSO connection, today set up with the Qovery team and the `qovery enterprise-connection` CLI
// (https://www.qovery.com/docs/configuration/organization/sso), is managed from the console

type Protocol = 'saml' | 'oidc'

const CONNECTION_NAME = 'zipline-okta'

const QOVERY_VALUES: Record<Protocol, { label: string; value: string }[]> = {
  saml: [
    { label: 'Single sign-on URL', value: `https://auth.qovery.com/login/callback?connection=${CONNECTION_NAME}` },
    { label: 'Audience URI (SP Entity ID)', value: `urn:auth0:qovery:${CONNECTION_NAME}` },
    {
      label: 'Logout endpoint URL (optional)',
      value: `https://qovery.eu.auth0.com/oauth/global-token-revocation/connection/${CONNECTION_NAME}`,
    },
  ],
  oidc: [
    { label: 'Sign-in redirect URI', value: 'https://auth.qovery.com/login/callback' },
    { label: 'Sign-out redirect URI', value: 'https://auth.qovery.com/v2/logout' },
    {
      label: 'Initiate login URI (optional)',
      value: `https://console.qovery.com/login?connection=${CONNECTION_NAME}`,
    },
  ],
}

const ATTRIBUTES: Record<Protocol, { name: string; description: string }[]> = {
  saml: [
    { name: 'email', description: "User's email (e.g. user.email). Required." },
    { name: 'name', description: "User's full name (e.g. user.displayName). Required, except on Google." },
    { name: 'groups', description: 'Groups to sync, filtered with a regex such as .*Qovery.*' },
  ],
  oidc: [{ name: 'groups', description: 'Claim added to the ID token, filtered with a regex such as .*Qovery.*' }],
}

// Users who signed in with GitHub or Google before SSO: SSO creates separate accounts, the old ones must be removed
const CLASSIC_LOGIN_USERS = [
  { email: 'vincy@zipline.dev', provider: 'GitHub', ssoAccount: true, owner: true },
  { email: 'andy@zipline.dev', provider: 'Google', ssoAccount: true, owner: false },
  { email: 'nina@zipline.dev', provider: 'GitHub', ssoAccount: false, owner: false },
]

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-neutral bg-surface-neutral-subtle px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-neutral-subtle">{label}</p>
        <p className="truncate font-code text-xs text-neutral">{value}</p>
      </div>
      <CopyToClipboardButtonIcon content={value} />
    </div>
  )
}

function Step({
  index,
  title,
  done,
  children,
}: {
  index: number
  title: string
  done?: boolean
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <span
        className={twMerge(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
          done ? 'border-positive-strong bg-surface-positive-subtle text-positive' : 'border-neutral text-neutral'
        )}
      >
        {done ? <Icon iconName="check" /> : index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3 pb-6">
        <p className="text-sm font-medium text-neutral">{title}</p>
        {children}
      </div>
    </li>
  )
}

function SetupWizard({ onConnected }: { onConnected: () => void }) {
  const [protocol, setProtocol] = useState<Protocol>('saml')
  const [tested, setTested] = useState(false)

  return (
    <Panel
      title="Connect your identity provider"
      description="Members sign in with SSO, and their roles follow the groups they belong to in the IdP."
    >
      <ol className="p-4">
        <Step index={1} title="Choose the protocol your IdP uses">
          <SegmentedControl.Root
            className="w-fit text-sm"
            value={protocol}
            onValueChange={(value) => {
              setProtocol(value as Protocol)
              setTested(false)
            }}
          >
            <SegmentedControl.Item value="saml">SAML 2.0</SegmentedControl.Item>
            <SegmentedControl.Item value="oidc">OpenID Connect</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Step>

        <Step
          index={2}
          title={
            protocol === 'saml'
              ? 'Create a SAML 2.0 application in your IdP with these values'
              : 'Create an OIDC web application in your IdP with these values'
          }
        >
          <div className="flex flex-col gap-2">
            {QOVERY_VALUES[protocol].map((field) => (
              <CopyField key={field.label} {...field} />
            ))}
          </div>
          <div className="rounded border border-neutral">
            <p className="border-b border-neutral px-3 py-2 text-xs font-medium text-neutral">
              {protocol === 'saml' ? 'Attribute statements' : 'Claims'}
            </p>
            <ul className="divide-y divide-neutral">
              {ATTRIBUTES[protocol].map((attribute) => (
                <li key={attribute.name} className="flex gap-3 px-3 py-2 text-xs">
                  <code className="w-16 shrink-0 font-code text-neutral">{attribute.name}</code>
                  <span className="text-neutral-subtle">{attribute.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </Step>

        <Step index={3} title="Paste the details of the application">
          {protocol === 'saml' ? (
            <>
              <InputText name="saml-sign-on-url" label="IdP sign-on URL" value="" onChange={() => undefined} />
              <InputTextArea
                name="saml-certificate"
                label="Signing certificate (PEM)"
                value=""
                onChange={() => undefined}
              />
            </>
          ) : (
            <>
              <InputText
                name="oidc-discovery-url"
                label="Discovery URL (e.g. https://your-domain/.well-known/openid-configuration)"
                value=""
                onChange={() => undefined}
              />
              <div className="grid grid-cols-2 gap-3">
                <InputText name="oidc-client-id" label="Client ID" value="" onChange={() => undefined} />
                <InputText name="oidc-client-secret" label="Client secret" value="" onChange={() => undefined} />
              </div>
            </>
          )}
        </Step>

        <Step index={4} title="Test the sign-in, then enable SSO" done={tested}>
          <p className="text-xs text-neutral-subtle">
            Testing opens your IdP in a new window and checks that the email, name and groups come back as expected.
            Members keep their current login until SSO is enabled.
          </p>
          <div className="flex gap-2">
            <Button type="button" size="md" variant="outline" color="neutral" onClick={() => setTested(true)}>
              <Icon iconName={tested ? 'check' : 'vial'} iconStyle="regular" />
              {tested ? 'Sign-in tested: 4 groups received' : 'Test sign-in'}
            </Button>
            <Button type="button" size="md" disabled={!tested} onClick={onConnected}>
              Enable SSO
            </Button>
          </div>
        </Step>
      </ol>
    </Panel>
  )
}

function ConnectedSettings({ onDisconnect }: { onDisconnect: () => void }) {
  const { roles, groups } = useRbacPrototype()
  const [defaultRoleId, setDefaultRoleId] = useState('r-viewer')
  const [groupSync, setGroupSync] = useState(true)
  const [removedUsers, setRemovedUsers] = useState<string[]>([])
  const syncedGroups = groups.filter((group) => group.source === 'idp')
  const classicUsers = CLASSIC_LOGIN_USERS.filter((user) => !removedUsers.includes(user.email))
  const roleName = (roleId: string) => roles.find((role) => role.id === roleId)?.name

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title={
          <span className="flex items-center gap-2">
            Okta
            <Badge size="sm" variant="surface" color="green">
              <Icon iconName="circle-check" iconStyle="regular" className="mr-1" />
              Connected
            </Badge>
          </span>
        }
        description={`SAML 2.0 · connection ${CONNECTION_NAME} · last sign-in through SSO 4 min ago`}
        action={
          <div className="flex gap-2">
            <Button size="md" variant="outline" color="neutral">
              <Icon iconName="pen" iconStyle="regular" />
              Edit connection
            </Button>
            <Button size="md" variant="outline" color="red" onClick={onDisconnect}>
              Disconnect
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
          <InputSelect
            label="Default role"
            portal
            value={defaultRoleId}
            onChange={(value) => setDefaultRoleId(value as string)}
            options={roles.map((role) => ({ label: role.name, value: role.id }))}
            hint="Given to members who sign in through SSO and are in no synced group."
          />
          <div className="flex items-center rounded border border-neutral px-3">
            <InputToggle
              small
              value={groupSync}
              onChange={setGroupSync}
              title="Sync groups"
              description="Members' groups are read from the IdP at each sign-in. Needs the groups attribute."
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Synced groups"
        description="IdP groups synced as Qovery groups. Membership comes from the IdP; the roles of each group are set on the Groups page."
        action={
          <Button size="md" variant="outline" color="neutral" disabled={!groupSync}>
            <Icon iconName="plus" />
            Sync a group
          </Button>
        }
      >
        {groupSync ? (
          <div className="divide-y divide-neutral">
            {syncedGroups.map((group) => (
              <div key={group.id} className="flex items-center gap-4 px-4 py-3">
                <span className="flex w-56 items-center gap-2 font-code text-sm text-neutral">
                  <Icon iconName={groupIcon(group)} iconStyle="regular" className="text-info" />
                  {group.name}
                </span>
                <span className="w-24 text-xs text-neutral-subtle">{group.memberIds.length} members</span>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {group.roleIds.map((roleId) => (
                    <Badge key={roleId} size="sm" variant="surface" color="brand">
                      {roleName(roleId)}
                    </Badge>
                  ))}
                </div>
                <Tooltip content="Stop syncing: members lose the roles of this group at their next sign-in">
                  <Button
                    size="md"
                    variant="outline"
                    color="neutral"
                    iconOnly
                    aria-label={`Stop syncing ${group.name}`}
                  >
                    <Icon iconName="link-slash" iconStyle="regular" />
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-neutral-subtle">
            Group sync is off: every member signing in through SSO gets the default role, {roleName(defaultRoleId)}.
          </p>
        )}
      </Panel>

      {classicUsers.length > 0 && (
        <Panel
          title="Accounts from the previous login"
          description="SSO creates a new account for each member at their first sign-in. Remove the old ones: they still count in billing."
        >
          <div className="divide-y divide-neutral">
            {classicUsers.map((user) => (
              <div key={user.email} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm text-neutral">{user.email}</p>
                  <p className="text-xs text-neutral-subtle">
                    Signs in with {user.provider}
                    {user.ssoAccount ? ' · SSO account already created' : ' · has not signed in with SSO yet'}
                  </p>
                </div>
                {user.owner ? (
                  <Button size="md" variant="outline" color="neutral" disabled={!user.ssoAccount}>
                    Transfer ownership to SSO account
                  </Button>
                ) : (
                  <Tooltip content="Wait for their first SSO sign-in, or they lose access" disabled={user.ssoAccount}>
                    <span>
                      <Button
                        size="md"
                        variant="outline"
                        color="red"
                        disabled={!user.ssoAccount}
                        onClick={() => setRemovedUsers([...removedUsers, user.email])}
                      >
                        Remove old account
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

export function IdentityProviderTab() {
  const { hasIdp, setHasIdp } = useRbacPrototype()

  return hasIdp ? (
    <ConnectedSettings onDisconnect={() => setHasIdp(false)} />
  ) : (
    <div className="flex flex-col gap-6">
      <Callout.Root color="neutral">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextDescription>
            Today this setup is done with the Qovery team and the{' '}
            <code className="font-code">qovery enterprise-connection</code> CLI. Here it becomes self-service.
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
      <SetupWizard onConnected={() => setHasIdp(true)} />
    </div>
  )
}
