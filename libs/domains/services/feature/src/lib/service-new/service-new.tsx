import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum, type LifecycleTemplateListResponseResultsInner } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Badge, Button, Heading, Icon, InputSearch, Link, Section, useModal } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { BlueprintDetailModal } from './blueprint-detail-modal/blueprint-detail-modal'
import { BlueprintServiceDemo } from './blueprint-service-demo/blueprint-service-demo'
import { BlueprintWizard } from './blueprint-wizard'
import {
  type BlueprintEntry,
  CATEGORY_LABELS,
  type CategoryKey,
  MOCK_BLUEPRINTS,
  PROVIDER_CONFIG,
  type ProviderKey,
} from './blueprints'

// ─── DefaultServiceItem ───────────────────────────────────────────────────────

interface DefaultServiceItemProps {
  icon: React.ReactNode
  label: string
  description: string
  to?: string
  onClick?: () => void
  disabled?: boolean
}

function DefaultServiceItem({ icon, label, description, to, onClick, disabled }: DefaultServiceItemProps) {
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-neutral-component">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm text-neutral">{label}</span>
        <span className="text-ssm text-neutral-subtle">{description}</span>
      </span>
      {!disabled && (
        <Icon iconName="arrow-right" iconStyle="regular" className="shrink-0 text-xs text-neutral-subtle" />
      )}
    </>
  )

  const className = twMerge(
    'flex items-center gap-3 rounded-lg border border-neutral p-3 font-normal transition',
    disabled ? 'cursor-default bg-surface-neutral-subtle' : 'cursor-pointer hover:bg-surface-neutral-subtle'
  )

  if (disabled) {
    return <div className={className}>{inner}</div>
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        className={className}
      >
        {inner}
      </div>
    )
  }

  return (
    // @ts-expect-error-next-line TODO new-nav : Route strings need to be updated using the next typed routes
    <Link to={to} className={className}>
      {inner}
    </Link>
  )
}

// ─── BlueprintCard ─────────────────────────────────────────────────────────────

function BlueprintCard({
  blueprint,
  onUse,
  onDetails,
}: {
  blueprint: BlueprintEntry
  onUse: (id: string) => void
  onDetails: (id: string) => void
}) {
  const providerCfg = PROVIDER_CONFIG[blueprint.provider]

  return (
    <div className="grid grid-rows-[1fr_auto] rounded-xl border border-neutral bg-surface-neutral-subtle">
      {/* Inner white surface with its own outline — the outline's rounded bottom corners are the second radius arc */}
      <div className="flex flex-col gap-3 rounded-xl bg-background p-4 outline outline-[1px] outline-neutral">
        {/* Provider icon + new badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-neutral-component">
            {providerCfg.icon ? (
              <img
                src={providerCfg.icon}
                alt={providerCfg.label}
                className="h-5 w-5 select-none object-contain"
              />
            ) : (
              <Icon iconName="layer-group" className="text-sm text-brand" />
            )}
          </div>
          {blueprint.isNew && (
            <Badge size="sm" color="brand" variant="surface">
              New
            </Badge>
          )}
        </div>

        {/* Name + description */}
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-neutral">{blueprint.name}</p>
          <p className="line-clamp-2 text-ssm leading-normal text-neutral-subtle">{blueprint.description}</p>
        </div>

        {/* Provider + category tags */}
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          <Badge size="sm" color={providerCfg.color} variant="surface">
            {providerCfg.label}
          </Badge>
          {blueprint.categories.map((cat) => (
            <Badge key={cat} size="sm" color="neutral" variant="outline">
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Bottom action bar — transparent, grey outer background shows through */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Button size="sm" color="neutral" variant="outline" radius="rounded" onClick={() => onUse(blueprint.id)}>
          Use
        </Button>
        <Button size="sm" color="neutral" variant="plain" radius="rounded" onClick={() => onDetails(blueprint.id)}>
          View details
        </Button>
        <span className="ml-auto font-mono text-xs text-neutral-subtle">v{blueprint.versions[0]?.version}</span>
      </div>
    </div>
  )
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        'inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition',
        active
          ? 'border-brand-component bg-surface-brand-component text-brand'
          : 'border-neutral bg-surface-neutral-component text-neutral hover:bg-surface-neutral-componentHover'
      )}
    >
      {label}
    </button>
  )
}

// ─── ServiceNew ───────────────────────────────────────────────────────────────

const PROVIDER_FILTERS: Array<{ key: ProviderKey | 'all'; label: string }> = [
  { key: 'all', label: 'All providers' },
  { key: 'aws', label: 'AWS' },
  { key: 'gcp', label: 'GCP' },
  { key: 'helm', label: 'Helm' },
  { key: 'qovery', label: 'Qovery' },
]

const CATEGORY_FILTERS: Array<{ key: CategoryKey | 'all'; label: string }> = [
  { key: 'all', label: 'All categories' },
  { key: 'database', label: 'Database' },
  { key: 'storage', label: 'Storage' },
  { key: 'cache', label: 'Cache' },
  { key: 'application', label: 'Application' },
  { key: 'networking', label: 'Networking' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'stack', label: 'Stack' },
]

function getEnvServicePath(orgId: string, projId: string, envId: string, sub: string) {
  return `/organization/${orgId}/project/${projId}/environment/${envId}/service${sub}`
}

export interface ServiceNewProps {
  organizationId: string
  projectId: string
  environmentId: string
  cloudProvider?: CloudProviderEnum | string
  availableTemplates?: LifecycleTemplateListResponseResultsInner[]
}

export function ServiceNew({ organizationId, projectId, environmentId }: ServiceNewProps) {
  const isTerraformEnabled = Boolean(useFeatureFlagEnabled('terraform'))
  const { showPylonForm } = useSupportChat()
  const { openModal, closeModal } = useModal()
  const [searchInput, setSearchInput] = useState('')
  const [activeProvider, setActiveProvider] = useState<ProviderKey | 'all'>('all')
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all')
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [activeWizardBlueprint, setActiveWizardBlueprint] = useState<BlueprintEntry | null>(null)
  const [demoOpen, setDemoOpen] = useState(false)

  const defaultServices: DefaultServiceItemProps[] = [
    {
      label: 'Application',
      description: 'Deploy from Git or a container registry.',
      icon: <Icon name="APPLICATION" width={18} height={18} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/application'),
    },
    {
      label: 'Database',
      description: 'Deploy a managed or containerized database.',
      icon: <Icon name="DATABASE" width={18} height={18} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/database'),
    },
    {
      label: 'Lifecycle job',
      description: 'Run scripts on deploy, pause, or delete.',
      icon: <Icon name="LIFECYCLE_JOB" width={18} height={18} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/lifecycle-job'),
    },
    {
      label: 'Cron job',
      description: 'Run scripts on a repeating schedule.',
      icon: <Icon name="CRON_JOB" width={18} height={18} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/cron-job'),
    },
    {
      label: 'Helm chart',
      description: 'Deploy any Helm chart on your cluster.',
      icon: <Icon name="HELM" width={18} height={18} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/helm'),
    },
    {
      label: 'Terraform',
      description: 'Provision cloud resources via Terraform.',
      icon: <Icon name="TERRAFORM" width={18} height={18} />,
      to: isTerraformEnabled
        ? getEnvServicePath(organizationId, projectId, environmentId, '/create/terraform')
        : undefined,
      onClick: !isTerraformEnabled ? () => showPylonForm('request-upgrade-plan') : undefined,
    },
  ]

  const matchesSearch = (text: string) => text.toLowerCase().includes(searchInput.toLowerCase())

  const filteredDefaultServices = searchInput
    ? defaultServices.filter(({ label, description }) => matchesSearch(label) || matchesSearch(description))
    : defaultServices

  const filteredBlueprints = MOCK_BLUEPRINTS.filter((b) => {
    if (searchInput) {
      const inName = matchesSearch(b.name)
      const inDesc = matchesSearch(b.description)
      const inCat = b.categories.some((c) => matchesSearch(CATEGORY_LABELS[c]))
      if (!inName && !inDesc && !inCat) return false
    }
    if (activeProvider !== 'all' && b.provider !== activeProvider) return false
    if (activeCategory !== 'all' && !b.categories.includes(activeCategory as CategoryKey)) return false
    if (showNewOnly && !b.isNew) return false
    return true
  })

  const handleUse = (blueprintId: string) => {
    const blueprint = MOCK_BLUEPRINTS.find((b) => b.id === blueprintId)
    if (!blueprint) return
    posthog.capture('select-blueprint', { blueprintId })
    setActiveWizardBlueprint(blueprint)
  }

  const handleDetails = (blueprintId: string) => {
    const blueprint = MOCK_BLUEPRINTS.find((b) => b.id === blueprintId)
    if (!blueprint) return
    posthog.capture('view-blueprint-details', { blueprintId })
    openModal({
      content: <BlueprintDetailModal blueprint={blueprint} onClose={closeModal} onUse={handleUse} />,
    })
  }

  const handleClearFilters = () => {
    setActiveProvider('all')
    setActiveCategory('all')
    setShowNewOnly(false)
  }

  const hasActiveFilter = activeProvider !== 'all' || activeCategory !== 'all' || showNewOnly
  const isSearching = searchInput.length > 0

  if (activeWizardBlueprint) {
    return (
      <BlueprintWizard
        blueprint={activeWizardBlueprint}
        organizationId={organizationId}
        projectId={projectId}
        environmentId={environmentId}
        onExit={() => setActiveWizardBlueprint(null)}
      />
    )
  }

  if (demoOpen) {
    // Demo: a blueprint service that's running v1.1.0 of aws-postgres on Postgres 15
    const demoBlueprint = MOCK_BLUEPRINTS.find((b) => b.id === 'nginx-ingress')
    if (demoBlueprint) {
      return (
        <BlueprintServiceDemo
          blueprint={demoBlueprint}
          serviceName="my-ingress"
          currentVersion="1.2.0"
          majorServiceVersion="NGINX 1.x"
          onExit={() => setDemoOpen(false)}
        />
      )
    }
  }

  return (
    <>
      <div className="mb-10 flex items-center justify-center gap-3">
        <InputSearch
          autofocus
          placeholder="Search services and blueprints…"
          className="w-[400px]"
          customSize="h-9 text-xs rounded-full"
          onChange={setSearchInput}
        />
        <Button
          size="sm"
          color="neutral"
          variant="outline"
          radius="rounded"
          onClick={() => setDemoOpen(true)}
          aria-label="Open blueprint service demo"
        >
          <Icon iconName="flask" iconStyle="regular" className="mr-2 text-xs" />
          Service page demo
        </Button>
      </div>

      <div className="mx-auto flex w-[1024px] flex-col gap-12 pb-24">
        {/* Qovery services */}
        {(!isSearching || filteredDefaultServices.length > 0) && (
          <Section>
            <div className="mb-5">
              <Heading className="text-base">Qovery services</Heading>
              <p className="mt-1 text-ssm text-neutral-subtle">
                Platform-managed services for applications, databases, and jobs.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {filteredDefaultServices.map((props) => (
                <DefaultServiceItem key={props.label} {...props} />
              ))}
            </div>
          </Section>
        )}

        {/* Blueprints */}
        {(!isSearching || filteredBlueprints.length > 0) && (
          <Section>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <Heading className="text-base">Blueprints</Heading>
                <p className="mt-1 text-ssm text-neutral-subtle">
                  Curated Terraform modules and Helm charts — configure, deploy, and manage from one place.
                </p>
              </div>
              {filteredBlueprints.length > 0 && (
                <span className="mt-1 shrink-0 text-xs text-neutral-subtle">
                  {filteredBlueprints.length} blueprint{filteredBlueprints.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Filter bar — hidden while searching */}
            {!isSearching && (
              <div className="mb-6 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {PROVIDER_FILTERS.map(({ key, label }) => (
                    <FilterChip
                      key={key}
                      label={label}
                      active={activeProvider === key}
                      onClick={() => setActiveProvider(key)}
                    />
                  ))}
                  <span className="mx-1 h-4 border-l border-neutral" />
                  <FilterChip
                    label="Newly added"
                    active={showNewOnly}
                    onClick={() => setShowNewOnly((v) => !v)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_FILTERS.map(({ key, label }) => (
                    <FilterChip
                      key={key}
                      label={label}
                      active={activeCategory === key}
                      onClick={() => setActiveCategory(key)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredBlueprints.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredBlueprints.map((blueprint) => (
                  <BlueprintCard key={blueprint.id} blueprint={blueprint} onUse={handleUse} onDetails={handleDetails} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-neutral py-12 text-center">
                <Icon iconName="box-open" className="mb-3 text-2xl text-neutral-subtle" />
                <p className="text-sm font-medium text-neutral">No blueprints match your filters</p>
                <p className="mt-1 text-xs text-neutral-subtle">
                  Try a different provider or category.
                </p>
                {hasActiveFilter && (
                  <Button
                    variant="plain"
                    color="brand"
                    size="sm"
                    radius="rounded"
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </Section>
        )}

        {/* Global empty state — search matched nothing at all */}
        {isSearching && filteredDefaultServices.length === 0 && filteredBlueprints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon iconName="magnifying-glass" className="mb-3 text-2xl text-neutral-subtle" />
            <p className="text-sm font-medium text-neutral">No results for &#8220;{searchInput}&#8221;</p>
            <p className="mt-1 text-xs text-neutral-subtle">
              Try a shorter term or clear the search to browse everything.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
