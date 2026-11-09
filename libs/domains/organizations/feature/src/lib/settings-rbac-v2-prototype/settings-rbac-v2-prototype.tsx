import { type ReactNode } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, EmptyState, Icon, Section, SegmentedControl, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SettingsRoles } from '../settings-roles/settings-roles'
import { type PrototypeMode, stageAtLeast } from './rbac-v2-mock-data'
import { useRbacPrototype } from './rbac-v2-prototype-context'
import { DelegationsTab } from './tabs/delegations-tab'
import { ForbiddenMembersDemo } from './tabs/forbidden-members-demo'
import { GroupsTab } from './tabs/groups-tab'
import { GuardrailsTab } from './tabs/guardrails-tab'
import { IdentityProviderTab } from './tabs/identity-provider-tab'
import { MembersTab } from './tabs/members-tab'
import { PrincipalsTab } from './tabs/principals-tab'
import { RolesTargetedTab } from './tabs/roles-targeted-tab'

export { stageAtLeast } from './rbac-v2-mock-data'

export type RbacV2PageId =
  | 'members'
  | 'roles'
  | 'groups'
  | 'identity-provider'
  | 'delegations'
  | 'service-accounts'
  | 'guardrails'
  | 'demo-403-members'

interface RbacV2Page {
  id: RbacV2PageId
  title: (isTarget: boolean) => string
  // Shorter label for the settings sidebar, defaults to the title
  navTitle?: (isTarget: boolean) => string
  description: (isTarget: boolean) => string
  // Roadmap stage the page arrives in; hidden from the sidebar before that
  since?: PrototypeMode
  // Rendered without the settings heading
  fullPage?: boolean
  content: ReactNode
}

// Each page is a sub-item of the Team group in the settings sidebar. Its path is `settings/<id>`.
export const RBAC_V2_PAGES: RbacV2Page[] = [
  {
    id: 'members',
    title: () => 'Members',
    description: (isTarget) =>
      isTarget
        ? 'Members hold roles directly, through groups or through delegated grants. Their access is the union of all of them.'
        : 'Members can now hold several roles. Their access is the union of all of them.',
    content: <MembersTab />,
  },
  {
    id: 'groups',
    title: () => 'Groups',
    description: () => 'Groups synced from the IdP or created in Qovery. Members get all of the group roles.',
    since: 'target',
    content: <GroupsTab />,
  },
  {
    id: 'roles',
    title: () => 'Roles & permissions',
    description: () =>
      'A role defines what its members can do. Members can hold several roles: their access is the union of all of them.',
    content: <RolesTargetedTab />,
  },
  {
    id: 'identity-provider',
    title: () => 'Identity provider',
    navTitle: () => 'Identity provider (SSO)',
    description: () =>
      'Connect your IdP with SAML or OIDC, choose the default role and which groups to sync. Replaces the enterprise-connection CLI.',
    since: 'target',
    content: <IdentityProviderTab />,
  },
  {
    id: 'delegations',
    title: () => 'Delegations',
    description: () => 'Let non-admin users assign a fixed list of roles, with a max duration and an approval path.',
    since: 'target',
    content: <DelegationsTab />,
  },
  {
    id: 'service-accounts',
    title: () => 'Service accounts & agents',
    navTitle: () => 'Accounts & agents',
    description: () =>
      'Non-human principals, each with a human owner accountable for what it does. They replace the API tokens and policy tokens.',
    since: 'target',
    content: <PrincipalsTab />,
  },
  {
    id: 'guardrails',
    title: () => 'Guardrails',
    description: () => 'Company-wide checks that apply to everyone, admins and agents included.',
    since: 'target',
    content: <GuardrailsTab />,
  },
  {
    id: 'demo-403-members',
    title: () => 'Demo 403 - Members',
    description: () => 'What a user sees when opening the members page without the Manage members capability.',
    fullPage: true,
    since: 'r1',
    content: <ForbiddenMembersDemo />,
  },
]

const MODE_SUMMARY: Record<PrototypeMode, string> = {
  mvp: "MVP: multi-role assignment on today's role permissions (clusters, project × environment type, shell and port-forward). Each Zipline instance is its own project. IdP mapping stays as in v1 (configured via the CLI) and groups are not shown.",
  r1: "Next: labels and tags merged into one concept, set on clusters, projects, environments and services, used to scope roles and optionally propagated to Kubernetes and as cloud provider tags. Each permission targets one kind of object (clusters, projects, environments or services) and grants that target's capabilities on the objects matching the selected resources and labels, e.g. Deployer on environments running on cluster A AND env_type = dev. Existing roles are migrated with the same access.",
  target:
    'Target: the identity provider set up in the console instead of the CLI, group management (groups synced from the IdP or created in Qovery, each holding several roles), delegated time-capped assignments with an approval path, service accounts and agents with an owner (replacing API tokens), company guardrails, NOT conditions and limits on permissions, and a UI that adapts to permissions.',
}

// A switch option with an (i) icon explaining what it shows
function SwitchLabel({ label, description }: { label: string; description: string }) {
  return (
    <>
      {label}
      <Tooltip content={description} classNameContent="max-w-sm">
        <span className="ml-1.5 flex items-center text-xs text-neutral-subtle" aria-label={`About ${label}`}>
          <Icon iconName="circle-info" iconStyle="regular" />
        </span>
      </Tooltip>
    </>
  )
}

const IDP_SUMMARY = {
  idp: 'An identity provider (Okta, Microsoft Entra ID, Google Workspace…) is connected: members sign in with SSO and their IdP groups give them roles.',
  'no-idp':
    'No identity provider: members sign in with Google, GitHub or email, and every role is assigned by hand in Qovery. The console suggests connecting one.',
}

export const STAGES: { mode: PrototypeMode; label: string }[] = [
  { mode: 'mvp', label: 'MVP' },
  { mode: 'r1', label: 'Next' },
  { mode: 'target', label: 'Target' },
]

const stageLabel = (mode: PrototypeMode) => STAGES.find((stage) => stage.mode === mode)?.label ?? mode

// Floating switch, rendered once by the settings layout so it stays visible on every settings page
export function RbacV2ModeSwitch() {
  const { mode, setMode, hasIdp, setHasIdp } = useRbacPrototype()

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-3xl border border-neutral bg-surface-neutral px-3 py-1.5 shadow-lg">
      <Badge size="sm" variant="surface" color="purple">
        RBAC v2 prototype
      </Badge>
      <SegmentedControl.Root
        className="text-sm"
        value={mode}
        onValueChange={(value) => setMode(value as PrototypeMode)}
      >
        {STAGES.map((stage) => (
          <SegmentedControl.Item key={stage.mode} value={stage.mode}>
            <SwitchLabel label={stage.label} description={MODE_SUMMARY[stage.mode]} />
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
      <SegmentedControl.Root
        className="text-sm"
        aria-label="Identity provider"
        value={hasIdp ? 'idp' : 'no-idp'}
        onValueChange={(value) => setHasIdp(value === 'idp')}
      >
        <SegmentedControl.Item value="idp">
          <SwitchLabel label="With IdP" description={IDP_SUMMARY.idp} />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="no-idp">
          <SwitchLabel label="Without IdP" description={IDP_SUMMARY['no-idp']} />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </div>
  )
}

export function SettingsRbacV2Page({ pageId }: { pageId: RbacV2PageId }) {
  const { mode, isTarget, hasTags, setMode } = useRbacPrototype()
  const page = RBAC_V2_PAGES.find((p) => p.id === pageId) ?? RBAC_V2_PAGES[0]

  useDocumentTitle(`${page.title(isTarget)} - Organization settings`)

  const isAvailable = !page.since || stageAtLeast(mode, page.since)
  if (page.fullPage && isAvailable) return page.content
  // The MVP does not change the role screen: it is today's page, with the organization's real roles
  if (page.id === 'roles' && !hasTags) return <SettingsRoles />

  return (
    <div className="w-full">
      <Section className="px-8 pb-16 pt-6">
        <SettingsHeading title={page.title(isTarget)} description={page.description(isTarget)} showNeedHelp={false} />
        {!isAvailable && page.since ? (
          <EmptyState
            icon="telescope"
            title={`${page.title(false)} comes with ${stageLabel(page.since)}`}
            description={`Switch to ${stageLabel(page.since)} to preview how it would look.`}
          >
            <Button size="md" className="mt-4" onClick={() => setMode(page.since ?? 'target')}>
              Show {stageLabel(page.since)}
            </Button>
          </EmptyState>
        ) : (
          page.content
        )}
      </Section>
    </div>
  )
}
