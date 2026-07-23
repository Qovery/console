import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  type BlueprintItem,
  type CloudProviderEnum,
  type LifecycleTemplateListResponseResultsInner,
} from 'qovery-typescript-axios'
import { type ReactNode, useMemo, useState } from 'react'
import { Button, Heading, Icon, InputSearch, Section, Skeleton } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { BlueprintDetailsPanel } from '../blueprint-details-panel/blueprint-details-panel'
import { BlueprintQueryBoundary } from '../blueprint-query-boundary/blueprint-query-boundary'
import { isBlueprintCompatibleWithCluster } from '../blueprint-utils/blueprint-utils'
import { useBlueprintCatalog } from '../hooks/use-blueprint-catalog/use-blueprint-catalog'
import { BlueprintCard } from './blueprint-card/blueprint-card'
import { BaseServiceCard, Card, CardService, SectionByTag, type ServiceBlock } from './service-card/service-card'
import { buildCreateFlowPathForType, getCreateFlowPath, getServicesPath } from './service-new-utils/service-new-utils'
import { serviceTemplates } from './service-templates'

export interface ServiceNewProps {
  organizationId: string
  projectId: string
  environmentId: string
  /** From environment.cloud_provider.provider (may be string from API) */
  cloudProvider?: CloudProviderEnum | string
  availableTemplates?: LifecycleTemplateListResponseResultsInner[]
}

function BlueprintSectionHeader({ action }: { action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Heading>Blueprints</Heading>
        <p className="text-sm leading-5 text-neutral-subtle">
          Qovery managed blueprints that you can deploy in a few clicks.
        </p>
      </div>
      {action}
    </div>
  )
}

function BlueprintSectionFallback() {
  return (
    <Section className="gap-4">
      <BlueprintSectionHeader action={<Skeleton width={240} height={36} />} />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="flex h-full min-h-[186px] flex-col gap-4 rounded-lg border border-neutral bg-surface-neutral p-4"
          >
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton width={36} height={36} />
              <div className="flex flex-col gap-2">
                <Skeleton width="50%" height={16} />
                <Skeleton height={14} />
                <Skeleton width="80%" height={14} />
              </div>
            </div>
            <div className="mt-auto flex items-center gap-1">
              <Skeleton width={58} height={28} />
              <Skeleton width={82} height={28} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function BlueprintSectionErrorFallback({
  resetErrorBoundary,
  title,
}: {
  resetErrorBoundary: () => void
  title: string
}) {
  return (
    <Section className="gap-4">
      <BlueprintSectionHeader />
      <div className="flex min-h-[186px] flex-col items-center justify-center gap-3 rounded border border-neutral bg-surface-neutral px-3 py-6 text-sm text-neutral-subtle">
        <span>Unable to load {title}.</span>
        <Button type="button" variant="plain" color="neutral" size="md" onClick={resetErrorBoundary}>
          <Icon iconName="rotate-right" className="text-xs" />
          Retry
        </Button>
      </div>
    </Section>
  )
}

function BlueprintSection({
  blueprintSearchInput,
  cloudProvider,
  onBlueprintSearchInputChange,
  onViewDetails,
}: {
  blueprintSearchInput: string
  cloudProvider?: CloudProviderEnum | string
  onBlueprintSearchInputChange: (value: string) => void
  onViewDetails: (blueprint: BlueprintItem) => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: blueprintCatalog } = useBlueprintCatalog({
    organizationId,
    suspense: true,
  })
  const blueprints = blueprintCatalog?.blueprints ?? []
  const filterBlueprint = ({ name, description, categories }: BlueprintItem) =>
    `${name} ${description} ${categories?.join(' ')}`.toLowerCase().includes(blueprintSearchInput.toLowerCase())
  const compatibleBlueprints = blueprints.filter((blueprint) =>
    isBlueprintCompatibleWithCluster(blueprint.provider, cloudProvider)
  )
  const filteredBlueprints = compatibleBlueprints.filter(filterBlueprint)

  if (compatibleBlueprints.length === 0) return null

  return (
    <Section className="gap-4">
      <BlueprintSectionHeader
        action={
          <InputSearch
            placeholder="Search blueprints..."
            className="w-60"
            customSize="h-9 text-sm"
            onChange={onBlueprintSearchInputChange}
          />
        }
      />
      {filteredBlueprints.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {filteredBlueprints.map((blueprint) => (
            <BlueprintCard
              key={`${blueprint.provider}-${blueprint.serviceFamily}`}
              blueprint={blueprint}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[186px] flex-col items-center justify-center rounded border border-neutral bg-surface-neutral px-3 py-6 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-subtle" />
          <p className="mt-1 text-xs font-medium text-neutral-subtle">No blueprints found</p>
        </div>
      )}
    </Section>
  )
}

export function ServiceNew({
  organizationId,
  projectId,
  environmentId,
  cloudProvider,
  availableTemplates = [],
}: ServiceNewProps) {
  const isTerraformFeatureFlag = Boolean(useFeatureFlagEnabled('terraform'))
  const isServiceCatalogEnabled = Boolean(useFeatureFlagEnabled('service-catalog'))
  const { showPylonForm } = useSupportChat()

  const serviceEmpty: ServiceBlock[] = useMemo(
    () => [
      {
        title: 'Application',
        description: 'Deploy a long running service running from Git or a Container Registry.',
        icon: <Icon name="APPLICATION" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, getCreateFlowPath('application')),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Container Database',
        description: 'Easy and fastest way to deploy the most popular databases.',
        icon: <Icon name="DATABASE" width={32} height={32} />,
        link: getServicesPath(
          organizationId,
          projectId,
          environmentId,
          buildCreateFlowPathForType('DATABASE', 'database', 'current') ?? '/service/create/database'
        ),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Lifecycle Job',
        description: 'Execute any type of script coming from Git or a Container Registry.',
        icon: <Icon name="LIFECYCLE_JOB" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, getCreateFlowPath('lifecycle-job')),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Cron Job',
        description: 'Execute any type of script at a regular basis.',
        icon: <Icon name="CRON_JOB" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, getCreateFlowPath('cron-job')),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Helm',
        description: 'Deploy a Helm Chart on your Kubernetes cluster.',
        icon: <Icon name="HELM" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, getCreateFlowPath('helm')),
        cloud_provider: cloudProvider,
      },
      ...(isTerraformFeatureFlag
        ? [
            {
              title: 'Terraform',
              description: 'Deploy external cloud resources directly from your Terraform configuration.',
              icon: <Icon name="TERRAFORM" width={32} height={32} />,
              link: getServicesPath(organizationId, projectId, environmentId, getCreateFlowPath('terraform')),
              cloud_provider: cloudProvider,
              badge: 'NEW',
            },
          ]
        : [
            {
              title: 'Terraform',
              description: 'Terraform native service is available only for organizations on the Team plan or higher.',
              icon: <Icon name="TERRAFORM" width={32} height={32} />,
              onClick: () => showPylonForm('request-upgrade-plan'),
              cloud_provider: cloudProvider,
              disabledCTA: (
                <p className="cursor-pointer text-xs font-medium text-neutral-subtle">
                  Upgrade your plan <Icon iconName="chevron-right" className="ml-1 text-2xs" />
                </p>
              ),
              badge: 'NEW',
            },
          ]),
    ],
    [cloudProvider, organizationId, projectId, environmentId, isTerraformFeatureFlag, showPylonForm]
  )

  const [blueprintSearchInput, setBlueprintSearchInput] = useState('')
  const [selectedBlueprint, setSelectedBlueprint] = useState<BlueprintItem | null>(null)
  const [isBlueprintDetailsOpen, setIsBlueprintDetailsOpen] = useState(false)

  const openBlueprintDetails = (blueprint: BlueprintItem) => {
    setSelectedBlueprint(blueprint)
    setIsBlueprintDetailsOpen(true)
  }

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        <Section className="gap-4">
          <div className="flex flex-col gap-1">
            <Heading>Base services</Heading>
            <p className="text-sm leading-5 text-neutral-subtle">
              Services without pre-configuration. These are the basic blocks to deploy any technical stack.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {serviceEmpty.map((service) => (
              <BaseServiceCard key={service.title} {...service} />
            ))}
          </div>
        </Section>
        {isServiceCatalogEnabled && (
          <BlueprintQueryBoundary
            errorFallback={BlueprintSectionErrorFallback}
            fallback={<BlueprintSectionFallback />}
            resetKeys={[organizationId, isServiceCatalogEnabled]}
            title="blueprint catalog"
          >
            <BlueprintSection
              blueprintSearchInput={blueprintSearchInput}
              cloudProvider={cloudProvider}
              onBlueprintSearchInputChange={setBlueprintSearchInput}
              onViewDetails={openBlueprintDetails}
            />
          </BlueprintQueryBoundary>
        )}
        {!isServiceCatalogEnabled && (
          <>
            <SectionByTag
              title="Data & Storage"
              description="Find your perfect data and storage template with presets."
              tag="DATA_STORAGE"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
            <SectionByTag
              title="Back-end"
              description="Find your perfect Back-end template with presets."
              tag="BACK_END"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
            <SectionByTag
              title="Front-end"
              description="Find your perfect Front-end template with presets."
              tag="FRONT_END"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
            <Section>
              <Heading className="mb-1">IAC</Heading>
              <p className="mb-5 text-xs text-neutral-subtle">
                Deploy external cloud resources with Terraform or use IAC templates.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {serviceEmpty
                  .filter((s) => s.title === 'Terraform')
                  .map((service) => (
                    <Card key={service.title} {...service} />
                  ))}
                {serviceTemplates
                  .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                  .filter(({ tag: t }) => t === 'IAC')
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((service) => (
                    <CardService
                      key={service.title}
                      availableTemplates={availableTemplates}
                      organizationId={organizationId}
                      projectId={projectId}
                      environmentId={environmentId}
                      cloudProvider={cloudProvider}
                      isTerraformFeatureFlag={isTerraformFeatureFlag}
                      onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
                      {...service}
                    />
                  ))}
              </div>
            </Section>
            <SectionByTag
              title="More template"
              description="Look for other template presets."
              tag="OTHER"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
          </>
        )}
      </div>
      <BlueprintDetailsPanel
        blueprint={selectedBlueprint}
        open={isBlueprintDetailsOpen}
        onOpenChange={setIsBlueprintDetailsOpen}
        onExitComplete={() => setSelectedBlueprint(null)}
      />
    </>
  )
}
