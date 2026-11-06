// Mock data for the RBAC v2 prototype. Nothing here is backed by the API: the organization is a Zipline-like setup
// (core app running as several production instances, Ares being HIPAA) used to demo the MVP and the target model.

// Roadmap stages, in order. MVP: multi-role assignment on today's roles. Next: tags and permissions.
// Target: the long-term vision, including the IdP set up in the console and group management.
export type PrototypeMode = 'mvp' | 'r1' | 'target'

export const STAGE_ORDER: PrototypeMode[] = ['mvp', 'r1', 'target']

export const stageAtLeast = (mode: PrototypeMode, since: PrototypeMode) =>
  STAGE_ORDER.indexOf(mode) >= STAGE_ORDER.indexOf(since)

export type CapabilityLevel = 'organization' | 'cluster' | 'project' | 'environment' | 'service'

export interface Capability {
  id: string
  label: string
  level: CapabilityLevel
  sensitive?: boolean
  // Roadmap stage the capability arrives in, with the settings page it controls
  since?: PrototypeMode
  // Organization capabilities are grouped like the settings sidebar
  area?: string
}

// Organization capabilities, one per settings page, grouped like the settings sidebar
export const ORGANIZATION_AREAS = [
  'General',
  'Team',
  'Billing',
  'Labels, annotations & tags',
  'Integrations',
  'AI',
  'Danger zone',
]

export const CAPABILITIES: Capability[] = [
  // Organization
  { id: 'org.settings', label: 'Edit general settings', level: 'organization', area: 'General' },
  { id: 'org.audit', label: 'View audit logs', level: 'organization', area: 'General' },
  { id: 'org.projects', label: 'Create projects', level: 'organization', area: 'General' },
  { id: 'org.clusters', label: 'Create clusters', level: 'organization', area: 'General' },
  { id: 'org.members', label: 'Manage members and invitations', level: 'organization', area: 'Team', sensitive: true },
  { id: 'org.roles', label: 'Manage roles', level: 'organization', area: 'Team', sensitive: true },
  { id: 'org.groups', label: 'Manage groups', level: 'organization', area: 'Team', since: 'target' },
  {
    id: 'org.idp',
    label: 'Manage identity provider (SSO)',
    level: 'organization',
    area: 'Team',
    since: 'target',
    sensitive: true,
  },
  { id: 'org.delegations', label: 'Manage delegations', level: 'organization', area: 'Team', since: 'target' },
  {
    id: 'org.principals',
    label: 'Manage service accounts and agents',
    level: 'organization',
    area: 'Team',
    since: 'target',
  },
  { id: 'org.guardrails', label: 'Manage guardrails', level: 'organization', area: 'Team', since: 'target' },
  { id: 'org.billing', label: 'Manage billing and plans', level: 'organization', area: 'Billing' },
  {
    id: 'org.labels',
    label: 'Manage labels and annotations',
    level: 'organization',
    area: 'Labels, annotations & tags',
  },
  {
    id: 'org.tags',
    label: 'Manage tags',
    level: 'organization',
    area: 'Labels, annotations & tags',
    since: 'r1',
    sensitive: true,
  },
  { id: 'org.argocd', label: 'Manage ArgoCD integration', level: 'organization', area: 'Integrations' },
  { id: 'org.registries', label: 'Manage container registries', level: 'organization', area: 'Integrations' },
  { id: 'org.helm', label: 'Manage Helm repositories', level: 'organization', area: 'Integrations' },
  { id: 'org.cloud', label: 'Manage cloud credentials', level: 'organization', area: 'Integrations', sensitive: true },
  { id: 'org.git', label: 'Manage Git repositories access', level: 'organization', area: 'Integrations' },
  { id: 'org.webhooks', label: 'Manage webhooks', level: 'organization', area: 'Integrations' },
  { id: 'org.tokens', label: 'Manage API tokens', level: 'organization', area: 'Integrations', sensitive: true },
  { id: 'org.blueprints', label: 'Manage blueprints', level: 'organization', area: 'Integrations', since: 'target' },
  { id: 'org.copilot', label: 'Manage AI Copilot and skills', level: 'organization', area: 'AI' },
  { id: 'org.agents', label: 'Manage agent tokens and MCP servers', level: 'organization', area: 'AI' },
  {
    id: 'org.delete',
    label: 'Delete the organization',
    level: 'organization',
    area: 'Danger zone',
    sensitive: true,
  },
  // Cluster
  { id: 'cluster.view', label: 'View cluster', level: 'cluster' },
  { id: 'cluster.deploy-on', label: 'Deploy on this cluster', level: 'cluster' },
  { id: 'cluster.update', label: 'Update cluster', level: 'cluster' },
  { id: 'cluster.tags', label: 'Edit tags', level: 'cluster', sensitive: true },
  { id: 'cluster.delete', label: 'Delete cluster', level: 'cluster', sensitive: true },
  // Project
  { id: 'project.view', label: 'View project', level: 'project' },
  { id: 'project.create-env', label: 'Create environments', level: 'project' },
  { id: 'project.clone-env', label: 'Clone environments', level: 'project', since: 'target' },
  { id: 'project.settings', label: 'Edit project settings', level: 'project' },
  { id: 'project.variables', label: 'Edit project variables and secrets', level: 'project', sensitive: true },
  { id: 'project.tags', label: 'Edit tags', level: 'project', sensitive: true },
  { id: 'project.delete', label: 'Delete project', level: 'project', sensitive: true },
  // Environment
  { id: 'env.view', label: 'View environment', level: 'environment' },
  { id: 'env.create-service', label: 'Create services', level: 'environment' },
  { id: 'env.settings', label: 'Edit environment settings', level: 'environment' },
  { id: 'env.variables', label: 'Edit environment variables and secrets', level: 'environment', sensitive: true },
  { id: 'env.tags', label: 'Edit tags', level: 'environment', sensitive: true },
  { id: 'env.deploy', label: 'Deploy', level: 'environment' },
  { id: 'env.restart', label: 'Restart', level: 'environment' },
  { id: 'env.stop', label: 'Stop', level: 'environment' },
  { id: 'env.delete', label: 'Delete environment', level: 'environment', sensitive: true },
  // Service
  { id: 'service.view', label: 'View service and status', level: 'service' },
  { id: 'service.config', label: 'View configuration (secrets masked)', level: 'service' },
  { id: 'service.logs', label: 'View logs', level: 'service' },
  { id: 'service.deploy', label: 'Deploy', level: 'service' },
  { id: 'service.restart', label: 'Restart', level: 'service' },
  { id: 'service.stop', label: 'Stop', level: 'service' },
  { id: 'service.edit-config', label: 'Edit configuration', level: 'service' },
  { id: 'service.read-variables', label: 'Read variable values (secrets are write-only)', level: 'service' },
  { id: 'service.variables', label: 'Edit variables and secrets', level: 'service', sensitive: true },
  { id: 'service.shell', label: 'Open a shell', level: 'service', sensitive: true },
  { id: 'service.port-forward', label: 'Port-forward', level: 'service', sensitive: true },
  { id: 'service.tags', label: 'Edit tags', level: 'service', sensitive: true },
  { id: 'service.delete', label: 'Delete service', level: 'service', sensitive: true },
]

export const CAPABILITY_LEVELS: { level: CapabilityLevel; label: string }[] = [
  { level: 'organization', label: 'Organization' },
  { level: 'cluster', label: 'Cluster' },
  { level: 'project', label: 'Project' },
  { level: 'environment', label: 'Environment' },
  { level: 'service', label: 'Service' },
]

export type PresetId = 'no-access' | 'viewer' | 'deployer' | 'operator' | 'manager'

const VIEWER = [
  'cluster.view',
  'project.view',
  'env.view',
  'service.view',
  'service.config',
  'service.logs',
  'service.read-variables',
]
const DEPLOYER = [
  ...VIEWER,
  'cluster.deploy-on',
  'env.deploy',
  'env.restart',
  'env.stop',
  'service.deploy',
  'service.restart',
  'service.stop',
]
const OPERATOR = [
  ...DEPLOYER,
  'project.variables',
  'env.settings',
  'env.variables',
  'service.edit-config',
  'service.variables',
  'service.shell',
  'service.port-forward',
]
const MANAGER = [
  ...OPERATOR,
  'project.create-env',
  'project.clone-env',
  'project.settings',
  'project.delete',
  'env.create-service',
  'env.delete',
  'service.delete',
]

export const PRESETS: { id: PresetId; label: string; description: string; capabilities: string[] }[] = [
  { id: 'no-access', label: 'No Access', description: 'Nothing', capabilities: [] },
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'View resources, status, configuration and logs',
    capabilities: VIEWER,
  },
  { id: 'deployer', label: 'Deployer', description: 'Viewer, plus deploy, restart and stop', capabilities: DEPLOYER },
  {
    id: 'operator',
    label: 'Operator',
    description: 'Deployer, plus edit configuration, variables and secrets, shell and port-forward',
    capabilities: OPERATOR,
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Operator, plus create and delete resources in scope',
    capabilities: MANAGER,
  },
]

export const ORGANIZATION_CAPABILITY_IDS = CAPABILITIES.filter((c) => c.level === 'organization').map((c) => c.id)

export const presetById = (id: PresetId) => PRESETS.find((preset) => preset.id === id) ?? PRESETS[0]
export const capabilityById = (id: string) => CAPABILITIES.find((capability) => capability.id === id)

// Tags

export interface TagCondition {
  key: string
  operator: '=' | '!='
  value: string
}

// Tags are a Qovery concept, separate from Kubernetes labels and annotations: they are set on clusters, projects,
// environments and services (services inherit their environment's tags) and are used to scope roles
export interface TagKey {
  key: string
  values: string[]
  builtIn?: boolean
}

export const TAG_KEYS: TagKey[] = [
  { key: 'env_type', values: ['dev', 'staging', 'prod'], builtIn: true },
  { key: 'instance', values: ['primary', 'ares', 'eu', 'us-2'] },
  { key: 'instance-type', values: ['standard', 'hipaa'] },
  { key: 'team', values: ['payments', 'signal', 'learning'] },
  { key: 'service', values: ['signal', 'course-proxy', 'api', 'worker'] },
  { key: 'cost-center', values: ['cc-1042', 'cc-2077'] },
]

export type ResourceKind = 'cluster' | 'project' | 'environment' | 'service'

export interface Resource {
  id: string
  name: string
  kind: ResourceKind
  parentId?: string
  // Environments only: the cluster they are deployed on
  clusterId?: string
  tags: Record<string, string>
}

export const RESOURCES: Resource[] = [
  { id: 'c-prod-us', name: 'prod-us', kind: 'cluster', tags: { 'instance-type': 'standard' } },
  { id: 'c-prod-hipaa', name: 'prod-hipaa', kind: 'cluster', tags: { 'instance-type': 'hipaa' } },
  { id: 'c-staging', name: 'staging', kind: 'cluster', tags: {} },
  { id: 'p-core', name: 'Core app', kind: 'project', tags: { team: 'learning', 'cost-center': 'cc-1042' } },
  { id: 'p-payments', name: 'Payments', kind: 'project', tags: { team: 'payments', 'cost-center': 'cc-2077' } },
  {
    id: 'e-primary',
    clusterId: 'c-prod-us',
    name: 'Primary',
    kind: 'environment',
    parentId: 'p-core',
    tags: { env_type: 'prod', instance: 'primary', 'instance-type': 'standard' },
  },
  {
    id: 'e-ares',
    clusterId: 'c-prod-hipaa',
    name: 'Ares',
    kind: 'environment',
    parentId: 'p-core',
    tags: { env_type: 'prod', instance: 'ares', 'instance-type': 'hipaa' },
  },
  {
    id: 'e-eu',
    clusterId: 'c-prod-us',
    name: 'EU',
    kind: 'environment',
    parentId: 'p-core',
    tags: { env_type: 'prod', instance: 'eu', 'instance-type': 'standard' },
  },
  {
    id: 'e-us2',
    clusterId: 'c-prod-us',
    name: 'US-2',
    kind: 'environment',
    parentId: 'p-core',
    tags: { env_type: 'prod', instance: 'us-2', 'instance-type': 'standard' },
  },
  {
    id: 'e-staging',
    clusterId: 'c-staging',
    name: 'Staging',
    kind: 'environment',
    parentId: 'p-core',
    tags: { env_type: 'staging' },
  },
  {
    id: 'e-dev-leo',
    clusterId: 'c-staging',
    name: 'dev-leo',
    kind: 'environment',
    parentId: 'p-core',
    tags: { env_type: 'dev' },
  },
  {
    id: 'e-pay-prod',
    clusterId: 'c-prod-us',
    name: 'Production',
    kind: 'environment',
    parentId: 'p-payments',
    tags: { env_type: 'prod' },
  },
  {
    id: 'e-pay-dev',
    clusterId: 'c-staging',
    name: 'Development',
    kind: 'environment',
    parentId: 'p-payments',
    tags: { env_type: 'dev' },
  },
  {
    id: 's-ares-proxy',
    name: 'course-proxy',
    kind: 'service',
    parentId: 'e-ares',
    tags: { service: 'course-proxy' },
  },
  { id: 's-ares-signal', name: 'signal', kind: 'service', parentId: 'e-ares', tags: { service: 'signal' } },
  { id: 's-primary-signal', name: 'signal', kind: 'service', parentId: 'e-primary', tags: { service: 'signal' } },
  { id: 's-eu-signal', name: 'signal', kind: 'service', parentId: 'e-eu', tags: { service: 'signal' } },
  { id: 's-primary-api', name: 'api', kind: 'service', parentId: 'e-primary', tags: { service: 'api' } },
]

export const resourceById = (id: string) => RESOURCES.find((resource) => resource.id === id)

// A resource's effective tags include the tags of its parents (a service inherits its environment's tags)
export const effectiveTags = (resource: Resource): Record<string, string> => {
  const parent = resource.parentId ? resourceById(resource.parentId) : undefined
  return { ...(parent ? effectiveTags(parent) : {}), ...resource.tags }
}

export const resourcePath = (resource: Resource): string => {
  const parent = resource.parentId ? resourceById(resource.parentId) : undefined
  return parent ? `${resourcePath(parent)} / ${resource.name}` : resource.name
}

export const matchesConditions = (resource: Resource, conditions: TagCondition[]) => {
  const tags = effectiveTags(resource)
  return conditions.every((condition) =>
    condition.operator === '=' ? tags[condition.key] === condition.value : tags[condition.key] !== condition.value
  )
}

// Next (by target): a permission targets one kind of object and grants that target's capabilities on the objects
// matching the selection. Environments include their services.
export type PermissionTarget = 'cluster' | 'project' | 'environment'

export const PERMISSION_TARGETS: { target: PermissionTarget; label: string; levels: CapabilityLevel[] }[] = [
  { target: 'cluster', label: 'Clusters', levels: ['cluster'] },
  { target: 'project', label: 'Projects', levels: ['project'] },
  { target: 'environment', label: 'Environments & services', levels: ['environment', 'service'] },
]

// A preset's capabilities, limited to the kind of object a permission targets
export const capabilitiesOfPreset = (preset: PresetId, target: PermissionTarget) => {
  const levels = PERMISSION_TARGETS.find((item) => item.target === target)?.levels ?? []
  return presetById(preset).capabilities.filter((id) => levels.includes(capabilityById(id)?.level ?? 'organization'))
}

// The preset whose capabilities are exactly these ones, if any
export const presetMatching = (capabilities: string[], target: PermissionTarget) =>
  PRESETS.find((preset) => {
    const presetCapabilities = capabilitiesOfPreset(preset.id, target)
    return (
      presetCapabilities.length === capabilities.length && presetCapabilities.every((id) => capabilities.includes(id))
    )
  })

// Filters of a permission, from broad to narrow. They combine with AND: in the selected projects, AND running on the
// selected clusters, AND matching every tag condition, AND among the selected environments and services. An empty
// filter does not restrict anything.
export const selectedIdsOfKind = (selection: RoleScope, kind: ResourceKind) =>
  selection.resourceIds.filter((id) => resourceById(id)?.kind === kind)

// Environments allowed by the broad filters (projects, clusters, tags), before picking specific ones
export const environmentsMatchingFilters = (selection: RoleScope) => {
  const projects = selectedIdsOfKind(selection, 'project')
  const clusters = selectedIdsOfKind(selection, 'cluster')
  return RESOURCES.filter(
    (resource) =>
      resource.kind === 'environment' &&
      (projects.length === 0 || projects.includes(resource.parentId ?? '')) &&
      (clusters.length === 0 || clusters.includes(resource.clusterId ?? '')) &&
      matchesConditions(resource, selection.conditions)
  )
}

export const matchTargetSelection = (target: PermissionTarget, selection: RoleScope) => {
  if (target !== 'environment') {
    const selected = selectedIdsOfKind(selection, target)
    const objects = RESOURCES.filter(
      (resource) =>
        resource.kind === target &&
        (selected.length === 0 || selected.includes(resource.id)) &&
        matchesConditions(resource, selection.conditions)
    )
    return { objects, services: [] as Resource[] }
  }

  const selectedEnvironments = selectedIdsOfKind(selection, 'environment')
  const selectedServices = selectedIdsOfKind(selection, 'service')
  const objects = environmentsMatchingFilters(selection).filter(
    (environment) =>
      (selectedEnvironments.length === 0 || selectedEnvironments.includes(environment.id)) &&
      (selectedServices.length === 0 || selectedServices.some((id) => resourceById(id)?.parentId === environment.id))
  )
  const services = RESOURCES.filter(
    (resource) =>
      resource.kind === 'service' &&
      objects.some((environment) => environment.id === resource.parentId) &&
      (selectedServices.length === 0 || selectedServices.includes(resource.id))
  )
  return { objects, services }
}

// Roles

// Scope of a resource permission: specific resources AND tag conditions, both optional (e.g. project Core app AND
// env_type = dev, which is how a v1 "project × environment type" permission is migrated). Neither set: every resource.
// Organization settings are not a scope: they are a section of the role.
export interface RoleScope {
  resourceIds: string[]
  conditions: TagCondition[]
}

export interface Role {
  id: string
  name: string
  description: string
  // Organization settings pages the role can manage (members, billing, integrations…)
  organizationCapabilities: string[]
  migratedFromV1?: boolean
  builtIn?: boolean
}

// Built-in roles are provided by Qovery and cannot be edited
export const INITIAL_ROLES: Role[] = [
  {
    id: 'r-admin',
    name: 'Admin',
    description: 'Full access to the organization, its settings and every resource.',
    builtIn: true,
    organizationCapabilities: ORGANIZATION_CAPABILITY_IDS,
  },
  {
    id: 'r-devops',
    name: 'DevOps',
    description: 'Manages the infrastructure and every resource, without members, roles or billing.',
    builtIn: true,
    organizationCapabilities: [
      'org.projects',
      'org.clusters',
      'org.registries',
      'org.helm',
      'org.git',
      'org.cloud',
      'org.labels',
      'org.tags',
      'org.argocd',
      'org.webhooks',
    ],
  },
  {
    id: 'r-billing',
    name: 'Billing Manager',
    description: 'Manages billing only.',
    builtIn: true,
    organizationCapabilities: ['org.billing'],
  },
  {
    id: 'r-viewer',
    name: 'Viewer',
    description: 'Read-only access to every resource.',
    builtIn: true,
    organizationCapabilities: [],
  },
  {
    id: 'r-backend',
    name: 'Backend Developer',
    description: 'Base role for every backend engineer.',
    organizationCapabilities: [],
  },
  {
    id: 'r-prod-primary',
    name: 'Prod Operator Primary',
    description: 'On-call access to the Primary production instance.',
    organizationCapabilities: [],
  },
  {
    id: 'r-prod-eu',
    name: 'Prod Operator EU',
    description: 'On-call access to the EU production instance.',
    organizationCapabilities: [],
  },
  {
    id: 'r-ares',
    name: 'Ares (HIPAA)',
    description: 'Kept out of every other role. Only granted to HIPAA-trained engineers.',
    organizationCapabilities: [],
  },
  {
    id: 'r-course-proxy',
    name: 'course-proxy on Ares',
    description: 'Deploy one service in one instance.',
    organizationCapabilities: [],
  },
  {
    id: 'r-signal',
    name: 'Signal deployer (non-HIPAA)',
    description: 'Service signal in every non-HIPAA instance.',
    organizationCapabilities: [],
  },
  {
    id: 'r-v1-qa',
    name: 'QA + Mirror + Demo',
    description: 'Converted from a v1 custom role, same access: each project × environment type level is a permission.',
    migratedFromV1: true,
    organizationCapabilities: [],
  },
  {
    id: 'r-v1-developer',
    name: 'Developer',
    description: 'Migrated from v1: same access, each v1 rule became a permission.',
    migratedFromV1: true,
    organizationCapabilities: [],
  },
]

// Principals, groups and assignments

export type PrincipalKind = 'user' | 'service-account' | 'agent'

export interface Principal {
  id: string
  name: string
  email?: string
  kind: PrincipalKind
  ownerId?: string
  personal?: boolean
  lastUsed?: string
  tokenExpiry?: string
}

export const PRINCIPALS: Principal[] = [
  { id: 'u-vincy', name: 'Vincy Park', email: 'vincy@zipline.dev', kind: 'user' },
  { id: 'u-andy', name: 'Andy Moreau', email: 'andy@zipline.dev', kind: 'user' },
  { id: 'u-marta', name: 'Marta Silva', email: 'marta@zipline.dev', kind: 'user' },
  { id: 'u-leo', name: 'Léo Martin', email: 'leo@zipline.dev', kind: 'user' },
  { id: 'u-sofia', name: 'Sofia Rossi', email: 'sofia@zipline.dev', kind: 'user' },
  { id: 'u-karim', name: 'Karim Haddad', email: 'karim@zipline.dev', kind: 'user' },
  { id: 'u-nina', name: 'Nina Chen', email: 'nina@zipline.dev', kind: 'user' },
  {
    id: 'sa-ci',
    name: 'github-actions-ci',
    kind: 'service-account',
    ownerId: 'u-vincy',
    lastUsed: '4 min ago',
    tokenExpiry: 'in 58 days',
  },
  {
    id: 'sa-tf',
    name: 'terraform-platform',
    kind: 'service-account',
    ownerId: 'u-marta',
    lastUsed: '2 days ago',
    tokenExpiry: 'in 21 days',
  },
  {
    id: 'ag-sre',
    name: 'sre-oncall-agent',
    kind: 'agent',
    ownerId: 'u-marta',
    lastUsed: '1 hour ago',
    tokenExpiry: 'in 6 days',
  },
  {
    id: 'ag-leo',
    name: "Léo's Claude Code",
    kind: 'agent',
    ownerId: 'u-leo',
    personal: true,
    lastUsed: '12 min ago',
    tokenExpiry: 'in 13 days',
  },
  {
    id: 'pat-sofia',
    name: 'sofia-cli',
    kind: 'service-account',
    ownerId: 'u-sofia',
    personal: true,
    lastUsed: '3 weeks ago',
    tokenExpiry: 'in 2 days',
  },
]

export const principalById = (id: string) => PRINCIPALS.find((principal) => principal.id === id)

export interface Group {
  id: string
  name: string
  source: 'idp' | 'qovery'
  memberIds: string[]
  roleIds: string[]
}

// In the MVP, IdP mappings are "one IdP group -> one role" and are stored as hidden groups behind the scenes.
// In the target model, the same objects become visible groups that can hold N roles.
export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g-backend',
    name: 'eng-backend',
    source: 'idp',
    memberIds: ['u-andy', 'u-leo', 'u-sofia', 'u-karim', 'u-nina'],
    roleIds: ['r-backend'],
  },
  { id: 'g-ares', name: 'qovery-ares', source: 'idp', memberIds: ['u-karim'], roleIds: ['r-ares'] },
  { id: 'g-platform', name: 'qovery-platform-admin', source: 'idp', memberIds: ['u-vincy'], roleIds: ['r-admin'] },
  {
    id: 'g-oncall',
    name: 'On-call rotation',
    source: 'qovery',
    memberIds: ['u-andy', 'u-marta'],
    roleIds: ['r-prod-primary', 'r-prod-eu'],
  },
]

export type AssignmentSource = 'admin' | 'delegated'

export interface Assignment {
  id: string
  principalId: string
  roleId: string
  source: AssignmentSource
  grantedBy: string
  expiresIn?: string
  justification?: string
}

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'a-1', principalId: 'u-marta', roleId: 'r-backend', source: 'admin', grantedBy: 'u-vincy' },
  { id: 'a-2', principalId: 'u-sofia', roleId: 'r-signal', source: 'admin', grantedBy: 'u-vincy' },
  { id: 'a-3', principalId: 'u-karim', roleId: 'r-course-proxy', source: 'admin', grantedBy: 'u-vincy' },
  { id: 'a-4', principalId: 'u-nina', roleId: 'r-v1-qa', source: 'admin', grantedBy: 'u-vincy' },
  { id: 'a-11', principalId: 'u-nina', roleId: 'r-v1-developer', source: 'admin', grantedBy: 'u-vincy' },
  {
    id: 'a-5',
    principalId: 'u-leo',
    roleId: 'r-prod-eu',
    source: 'delegated',
    grantedBy: 'u-marta',
    expiresIn: '4d 18h',
    justification: 'On-call week (rotation #44)',
  },
  {
    id: 'a-6',
    principalId: 'u-andy',
    roleId: 'r-prod-primary',
    source: 'delegated',
    grantedBy: 'u-marta',
    expiresIn: '5h 40m',
    justification: 'INC-482 — Primary latency',
  },
  { id: 'a-7', principalId: 'sa-ci', roleId: 'r-signal', source: 'admin', grantedBy: 'u-vincy' },
  { id: 'a-8', principalId: 'sa-tf', roleId: 'r-admin', source: 'admin', grantedBy: 'u-vincy' },
  { id: 'a-9', principalId: 'ag-sre', roleId: 'r-prod-primary', source: 'admin', grantedBy: 'u-marta' },
  { id: 'a-10', principalId: 'ag-leo', roleId: 'r-backend', source: 'admin', grantedBy: 'u-leo' },
]

export interface Delegation {
  id: string
  name: string
  delegateIds: string[]
  assignable: { roleId: string; maxDuration?: string }[]
}

export const DELEGATIONS: Delegation[] = [
  {
    id: 'd-oncall',
    name: 'On-call managers',
    delegateIds: ['u-marta', 'u-andy'],
    assignable: [
      { roleId: 'r-prod-primary', maxDuration: '12h' },
      { roleId: 'r-prod-eu', maxDuration: '7 days' },
    ],
  },
  {
    id: 'd-owners',
    name: 'Project owners',
    delegateIds: ['u-sofia'],
    assignable: [{ roleId: 'r-signal' }],
  },
]

export interface AccessRequest {
  id: string
  requesterId: string
  roleId: string
  duration: string
  justification: string
  requestedAt: string
}

export const ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req-1',
    requesterId: 'u-sofia',
    roleId: 'r-prod-eu',
    duration: '4h',
    justification: 'Swap Thursday night with Léo',
    requestedAt: '8 min ago',
  },
  {
    id: 'req-2',
    requesterId: 'u-nina',
    roleId: 'r-prod-primary',
    duration: '2h',
    justification: 'INC-486 — failed migration on Primary',
    requestedAt: '22 min ago',
  },
]

// "If tag key = value, then a service can request at most cpu and memory". Tagged rules apply to the services
// carrying the tag, the strictest wins when several match. The rule without condition is the default for the others.
export interface ResourceLimitRule {
  id: string
  condition?: TagCondition
  maxCpu: string
  maxMemory: string
}

export interface Guardrail {
  id: string
  title: string
  description: string
  enabled: boolean
  blockedLast30d: number
  rules?: ResourceLimitRule[]
}

export const GUARDRAILS: Guardrail[] = [
  {
    id: 'gr-public-repo',
    title: 'Never deploy from a public repository',
    description: 'Blocks any deployment whose source is a public Git repository.',
    enabled: true,
    blockedLast30d: 3,
  },
  {
    id: 'gr-resources',
    title: 'Resource limits per service',
    description: 'Blocks creating or editing a service above these limits.',
    enabled: true,
    blockedLast30d: 8,
    rules: [
      { id: 'rule-dev', condition: { key: 'env_type', operator: '=', value: 'dev' }, maxCpu: '2', maxMemory: '4' },
      {
        id: 'rule-payments',
        condition: { key: 'team', operator: '=', value: 'payments' },
        maxCpu: '8',
        maxMemory: '16',
      },
      { id: 'rule-default', maxCpu: '4', maxMemory: '8' },
    ],
  },
  {
    id: 'gr-terraform',
    title: 'No Terraform services',
    description: 'Terraform is run by the platform team outside Qovery.',
    enabled: false,
    blockedLast30d: 0,
  },
  {
    id: 'gr-pat',
    title: 'Personal tokens expire within 30 days',
    description: 'Maximum lifetime for personal access tokens and personal agents.',
    enabled: true,
    blockedLast30d: 0,
  },
]
