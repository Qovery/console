import * as Dialog from '@radix-ui/react-dialog'
import { useParams } from '@tanstack/react-router'
import { type BlueprintItem, type BlueprintReadmeResponse } from 'qovery-typescript-axios'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatCloudProvider } from '@qovery/domains/clusters/data-access'
import { Badge, Button, ExternalLink, Icon, Link, Sheet } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { formatBlueprintName } from '../blueprint-utils/blueprint-utils'
import { BlueprintQueryBoundary } from '../blueprint-query-boundary/blueprint-query-boundary'
import { useBlueprintCatalogServiceReadme } from '../hooks/use-blueprint-catalog-service-readme/use-blueprint-catalog-service-readme'
import { ServiceAvatar } from '../service-avatar/service-avatar'

function getBlueprintRepositoryName({ provider, serviceFamily }: BlueprintItem) {
  return `qovery-blueprints/${serviceFamily || provider}`
}

interface BlueprintReadmeContentProps {
  content: string
}

function BlueprintReadmeContent({ content }: BlueprintReadmeContentProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, children, ...props }) => (
          <h1 className="mb-4 text-2xl font-medium leading-8 text-neutral" {...props}>
            {children}
          </h1>
        ),
        h2: ({ node, children, ...props }) => (
          <h2 className="mb-3 mt-6 text-lg font-medium leading-7 text-neutral" {...props}>
            {children}
          </h2>
        ),
        h3: ({ node, children, ...props }) => (
          <h3 className="mb-2 mt-5 text-base font-medium leading-6 text-neutral" {...props}>
            {children}
          </h3>
        ),
        p: ({ node, ...props }) => <p className="my-3 text-sm leading-6 text-neutral" {...props} />,
        a: ({ node, children, ...props }) => (
          <a className="font-medium text-brand hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
        ul: ({ node, ...props }) => <ul className="my-3 list-disc space-y-1 pl-5 text-sm text-neutral" {...props} />,
        ol: ({ node, ...props }) => <ol className="my-3 list-decimal space-y-1 pl-5 text-sm text-neutral" {...props} />,
        code: ({ node, className, ...props }) => (
          <code
            className={twMerge('rounded bg-surface-neutral-subtle px-1 py-0.5 font-mono text-xs', className)}
            {...props}
          />
        ),
        pre: ({ node, ...props }) => (
          <pre
            className="my-4 overflow-auto rounded border border-neutral bg-surface-neutral-subtle p-4 text-xs text-neutral"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="my-4 overflow-x-auto rounded border border-neutral">
            <table className="w-full border-collapse text-sm text-neutral" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="border-b border-r border-neutral px-3 py-2 text-left font-medium" {...props} />
        ),
        td: ({ node, ...props }) => <td className="border-b border-r border-neutral px-3 py-2" {...props} />,
      }}
    >
      {content}
    </Markdown>
  )
}

function BlueprintReadmeState({ readme }: { readme?: BlueprintReadmeResponse }) {
  if (!readme?.content) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-neutral-subtle">
        No blueprint details available.
      </div>
    )
  }

  return <BlueprintReadmeContent content={readme.content} />
}

function BlueprintReadme({ blueprint, serviceVersion }: { blueprint: BlueprintItem; serviceVersion: string }) {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: readme } = useBlueprintCatalogServiceReadme({
    organizationId,
    provider: blueprint.provider,
    serviceFamily: blueprint.serviceFamily ?? '',
    serviceVersion,
    enabled: Boolean(serviceVersion),
    suspense: true,
  })

  return <BlueprintReadmeState readme={readme} />
}

function BlueprintRepositoryBadge({ blueprint, serviceVersion }: { blueprint: BlueprintItem; serviceVersion: string }) {
  const { organizationId = '' } = useParams({ strict: false })
  const repositoryName = getBlueprintRepositoryName(blueprint)
  const { data: readme } = useBlueprintCatalogServiceReadme({
    organizationId,
    provider: blueprint.provider,
    serviceFamily: blueprint.serviceFamily ?? '',
    serviceVersion,
    enabled: Boolean(serviceVersion),
  })
  const repositoryUrl = readme?.repository_url

  if (repositoryUrl) {
    return (
      <ExternalLink
        href={repositoryUrl}
        as="button"
        variant="outline"
        color="neutral"
        size="xs"
        className="h-5 gap-1 text-xs font-normal"
        aria-label={`Open ${repositoryName} repository`}
      >
        <Icon name="GITHUB" width={12} height={12} />
        {repositoryName}
      </ExternalLink>
    )
  }

  return (
    <Badge size="sm" color="neutral" variant="outline" className="gap-1">
      <Icon name="GITHUB" width={12} height={12} />
      {repositoryName}
    </Badge>
  )
}

function BlueprintDetailsPanelContent({
  blueprint,
  footerMode,
  open,
  onExitComplete,
  onOpenChange,
}: {
  blueprint: BlueprintItem
  footerMode: 'close' | 'deploy'
  open: boolean
  onExitComplete: () => void
  onOpenChange: (open: boolean) => void
}) {
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false })
  const serviceVersion = blueprint.majorVersions[0]?.serviceVersion ?? ''
  const shouldDisplayServiceVersion = serviceVersion && serviceVersion !== 'default'
  const canDeploy = footerMode === 'deploy' && Boolean(blueprint.serviceFamily)

  const provider = formatCloudProvider(blueprint.provider)
  const blueprintName = formatBlueprintName(blueprint.name)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay forceMount className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content forceMount asChild>
          <Sheet
            open={open}
            onExited={onExitComplete}
            className="fixed bottom-0 right-0 top-0 z-modal w-[940px] max-w-[calc(100vw-32px)] focus:outline-none"
          >
            <div className="flex-1 overflow-auto px-6 pb-24 pt-6">
              <div className="mb-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Dialog.Title
                    aria-label={blueprintName}
                    className="flex items-center gap-3 pr-8 text-2xl font-medium leading-8 text-neutral"
                  >
                    <ServiceAvatar
                      className="h-8 w-8"
                      radius="none"
                      service={{ icon_uri: blueprint.icon, serviceType: 'APPLICATION' }}
                      serviceAvatarRadius="sm"
                      size="custom"
                    />
                    <span>{blueprintName}</span>
                  </Dialog.Title>
                  <Dialog.Description className="text-sm leading-5 text-neutral-subtle">
                    {blueprint.description}
                  </Dialog.Description>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <BlueprintRepositoryBadge blueprint={blueprint} serviceVersion={serviceVersion} />
                  <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                    {provider}
                  </Badge>
                  {shouldDisplayServiceVersion && (
                    <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                      v{serviceVersion}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="rounded border border-neutral bg-surface-neutral p-5">
                <BlueprintQueryBoundary
                  resetKeys={[organizationId, blueprint.provider, blueprint.serviceFamily, serviceVersion]}
                  title="blueprint details"
                >
                  <BlueprintReadme blueprint={blueprint} serviceVersion={serviceVersion} />
                </BlueprintQueryBoundary>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-neutral-subtle hover:bg-surface-neutral-subtle hover:text-neutral"
                aria-label="Close blueprint details"
              >
                <Icon iconName="xmark" />
              </button>
            </Dialog.Close>

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 border-t border-neutral bg-background px-6 py-4">
              {!canDeploy ? (
                <Button type="button" variant="plain" color="neutral" size="lg" onClick={() => onOpenChange(false)}>
                  {footerMode === 'close' ? 'Close' : 'Cancel'}
                </Button>
              ) : (
                <>
                  <Button type="button" variant="plain" color="neutral" size="lg" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Link
                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily"
                    params={{
                      organizationId,
                      projectId,
                      environmentId,
                      provider: blueprint.provider,
                      serviceFamily: blueprint.serviceFamily ?? '',
                    }}
                    as="button"
                    color="brand"
                    size="lg"
                  >
                    Deploy blueprint
                  </Link>
                </>
              )}
            </div>
          </Sheet>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function BlueprintDetailsPanel({
  blueprint,
  footerMode = 'deploy',
  open,
  onExitComplete,
  onOpenChange,
}: {
  blueprint: BlueprintItem | null
  footerMode?: 'close' | 'deploy'
  open: boolean
  onExitComplete: () => void
  onOpenChange: (open: boolean) => void
}) {
  if (!blueprint) return null

  return (
    <BlueprintDetailsPanelContent
      blueprint={blueprint}
      footerMode={footerMode}
      open={open}
      onExitComplete={onExitComplete}
      onOpenChange={onOpenChange}
    />
  )
}
