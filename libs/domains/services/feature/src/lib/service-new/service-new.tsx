import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum, type LifecycleTemplateListResponseResultsInner } from 'qovery-typescript-axios'
import { useState, type ReactNode } from 'react'
import { Button, Heading, Icon, InputSearch, Link, Section, SidePanel } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { BlueprintDetailModal } from './blueprint-detail-modal/blueprint-detail-modal'
import { BlueprintWizard } from './blueprint-wizard'
import { type BlueprintEntry, MOCK_BLUEPRINTS, PROVIDER_CONFIG } from './blueprints'

interface DefaultServiceItemProps {
  icon: ReactNode
  label: string
  to?: string
  onClick?: () => void
  disabled?: boolean
}

function DefaultServiceItem({ icon, label, to, onClick, disabled }: DefaultServiceItemProps) {
  const inner = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="flex min-w-0 flex-1">
        <span className="truncate text-sm font-medium text-neutral">{label}</span>
      </span>
      {!disabled && <Icon iconName="angle-right" iconStyle="regular" className="shrink-0 text-sm text-neutral-subtle" />}
    </>
  )

  const className = twMerge(
    'flex items-center gap-1.5 rounded-md border border-neutral bg-surface-neutral p-4 font-normal transition',
    disabled ? 'cursor-default' : 'cursor-pointer hover:bg-surface-neutral-subtle'
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
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
          }
        }}
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

function BlueprintCard({
  blueprint,
  onDeploy,
  onDetails,
}: {
  blueprint: BlueprintEntry
  onDeploy: (id: string) => void
  onDetails: (id: string) => void
}) {
  const providerCfg = PROVIDER_CONFIG[blueprint.provider]

  return (
    <div className="grid h-full grid-rows-[1fr_auto] rounded-md border border-neutral bg-surface-neutral-subtle">
      <div className="flex flex-1 flex-col gap-3 rounded-md bg-surface-neutral p-4 outline outline-1 outline-neutral">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-surface-neutral-component">
          {providerCfg.icon ? (
            <img src={providerCfg.icon} alt={providerCfg.label} className="h-5 w-5 select-none object-contain" />
          ) : (
            <Icon iconName="layer-group" className="text-sm text-brand" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-neutral">{blueprint.name}</p>
          <p className="line-clamp-3 text-ssm leading-normal text-neutral-subtle">{blueprint.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        <Button size="sm" color="neutral" variant="outline" radius="rounded" onClick={() => onDeploy(blueprint.id)}>
          Deploy
        </Button>
        <Button size="sm" color="neutral" variant="plain" radius="rounded" onClick={() => onDetails(blueprint.id)}>
          View details
        </Button>
      </div>
    </div>
  )
}

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
  const [blueprintSearch, setBlueprintSearch] = useState('')
  const [activeWizardBlueprint, setActiveWizardBlueprint] = useState<BlueprintEntry | null>(null)
  const [detailBlueprint, setDetailBlueprint] = useState<BlueprintEntry | null>(null)

  const defaultServices: DefaultServiceItemProps[] = [
    {
      label: 'Application',
      icon: <Icon name="APPLICATION" width={20} height={20} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/application'),
    },
    {
      label: 'Database',
      icon: <Icon name="DATABASE" width={20} height={20} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/database'),
    },
    {
      label: 'Lifecycle job',
      icon: <Icon name="LIFECYCLE_JOB" width={20} height={20} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/lifecycle-job'),
    },
    {
      label: 'Cron job',
      icon: <Icon name="CRON_JOB" width={20} height={20} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/cron-job'),
    },
    {
      label: 'Helm chart',
      icon: <Icon name="HELM" width={20} height={20} />,
      to: getEnvServicePath(organizationId, projectId, environmentId, '/create/helm'),
    },
    {
      label: 'Terraform',
      icon: <Icon name="TERRAFORM" width={20} height={20} />,
      to: isTerraformEnabled
        ? getEnvServicePath(organizationId, projectId, environmentId, '/create/terraform')
        : undefined,
      onClick: !isTerraformEnabled ? () => showPylonForm('request-upgrade-plan') : undefined,
    },
  ]

  const searchValue = blueprintSearch.trim().toLowerCase()

  const filteredBlueprints = MOCK_BLUEPRINTS.filter((blueprint) => {
    if (!searchValue) return true

    return (
      blueprint.name.toLowerCase().includes(searchValue) ||
      blueprint.description.toLowerCase().includes(searchValue) ||
      PROVIDER_CONFIG[blueprint.provider].label.toLowerCase().includes(searchValue)
    )
  })

  const handleDeploy = (blueprintId: string) => {
    const blueprint = MOCK_BLUEPRINTS.find((item) => item.id === blueprintId)
    if (!blueprint) return

    posthog.capture('select-blueprint', { blueprintId })
    setActiveWizardBlueprint(blueprint)
  }

  const handleDetails = (blueprintId: string) => {
    const blueprint = MOCK_BLUEPRINTS.find((item) => item.id === blueprintId)
    if (!blueprint) return

    posthog.capture('view-blueprint-details', { blueprintId })
    setDetailBlueprint(blueprint)
  }

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

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
        <Section className="flex flex-col gap-3">
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service"
            params={{ organizationId, projectId, environmentId }}
            className="inline-flex w-fit items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
          >
            <Icon iconName="arrow-left" iconStyle="regular" className="text-xs" />
            Back to services list
          </Link>
          <Heading className="text-3xl">Create a new service</Heading>
          <div className="h-px w-full bg-neutral" />
        </Section>

        <Section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Heading className="text-base">Base services</Heading>
            <p className="text-sm text-neutral-subtle">
              Services without pre-configuration. These are the basic blocks to deploy any technical stack.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {defaultServices.map((service) => (
              <DefaultServiceItem key={service.label} {...service} />
            ))}
          </div>
        </Section>

        <Section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Heading className="text-base">Blueprints</Heading>
              <p className="text-sm text-neutral-subtle">Qovery managed blueprints that you can deploy in a few clicks</p>
            </div>
            <InputSearch
              placeholder="Search blueprints..."
              className="w-full sm:w-[240px]"
              customSize="h-8 rounded-md text-sm"
              onChange={setBlueprintSearch}
            />
          </div>

          {MOCK_BLUEPRINTS.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-neutral py-16 text-center">
              <Icon iconName="folder-tree" className="mb-3 text-2xl text-neutral-subtle" />
              <p className="text-sm font-medium text-neutral">No blueprints in your catalog</p>
              <p className="mt-1 max-w-md text-ssm text-neutral-subtle">
                An organization admin can add a catalog source from Organization settings to make blueprints available
                here.
              </p>
            </div>
          ) : filteredBlueprints.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredBlueprints.map((blueprint) => (
                <BlueprintCard
                  key={blueprint.id}
                  blueprint={blueprint}
                  onDeploy={handleDeploy}
                  onDetails={handleDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-neutral py-12 text-center">
              <Icon iconName="magnifying-glass" className="mb-3 text-2xl text-neutral-subtle" />
              <p className="text-sm font-medium text-neutral">No blueprints found</p>
              <p className="mt-1 text-ssm text-neutral-subtle">Try a different search query.</p>
            </div>
          )}
        </Section>
      </div>

      <SidePanel open={Boolean(detailBlueprint)} onOpenChange={(open) => !open && setDetailBlueprint(null)} width={940}>
        {detailBlueprint ? (
          <BlueprintDetailModal
            blueprint={detailBlueprint}
            onClose={() => setDetailBlueprint(null)}
            onUse={(blueprintId) => {
              setDetailBlueprint(null)
              handleDeploy(blueprintId)
            }}
          />
        ) : null}
      </SidePanel>
    </>
  )
}
