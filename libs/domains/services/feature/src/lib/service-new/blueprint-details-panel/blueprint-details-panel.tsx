import * as Dialog from '@radix-ui/react-dialog'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type BlueprintItem } from 'qovery-typescript-axios'
import { type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge, Button, Icon } from '@qovery/shared/ui'
import { formatCloudProvider, twMerge } from '@qovery/shared/util-js'
import { useBlueprintCatalogServiceReadme } from '../../hooks/use-blueprint-catalog-service-readme/use-blueprint-catalog-service-readme'

function getBlueprintRepositoryName({ provider, serviceFamily }: BlueprintItem) {
  return `qovery-blueprints/${serviceFamily || provider}`
}

function BlueprintReadmeContent({ children }: { children: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="mb-4 text-2xl font-medium leading-8 text-neutral" {...props} />,
        h2: ({ node, ...props }) => <h2 className="mb-3 mt-6 text-lg font-medium leading-7 text-neutral" {...props} />,
        h3: ({ node, ...props }) => (
          <h3 className="mb-2 mt-5 text-base font-medium leading-6 text-neutral" {...props} />
        ),
        p: ({ node, ...props }) => <p className="my-3 text-sm leading-6 text-neutral" {...props} />,
        a: ({ node, ...props }) => (
          <a className="font-medium text-brand hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
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
      {children}
    </Markdown>
  )
}

function SuspenseQueryFallback({ title }: { title: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center gap-2 text-sm text-neutral-subtle">
      <Icon iconName="loader" className="animate-spin" />
      Loading {title}...
    </div>
  )
}

function SuspenseQueryErrorFallback({ resetErrorBoundary, title }: { resetErrorBoundary: () => void; title: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-neutral-subtle">
      <span>Unable to load {title}.</span>
      <Button type="button" variant="plain" color="neutral" size="md" onClick={resetErrorBoundary}>
        <Icon iconName="rotate-right" className="text-xs" />
        Retry
      </Button>
    </div>
  )
}

function SuspenseQueryBoundary({
  children,
  resetKeys,
  title,
}: {
  children: ReactNode
  resetKeys: unknown[]
  title: string
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <SuspenseQueryErrorFallback resetErrorBoundary={resetErrorBoundary} title={title} />
          )}
          onReset={reset}
          resetKeys={resetKeys}
        >
          <Suspense fallback={<SuspenseQueryFallback title={title} />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function BlueprintReadmeState({ readme }: { readme?: string }) {
  if (!readme) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-neutral-subtle">
        No blueprint details available.
      </div>
    )
  }

  return <BlueprintReadmeContent>{readme}</BlueprintReadmeContent>
}

function BlueprintReadme({
  blueprint,
  organizationId,
  serviceVersion,
}: {
  blueprint: BlueprintItem
  organizationId: string
  serviceVersion: string
}) {
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

export function BlueprintDetailsPanel({
  blueprint,
  environmentId,
  organizationId,
  projectId,
  open,
  onOpenChange,
}: {
  blueprint: BlueprintItem | null
  environmentId: string
  organizationId: string
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const serviceVersion = blueprint?.majorVersions[0]?.serviceVersion ?? ''

  if (!blueprint) return null

  const provider = formatCloudProvider(blueprint.provider)
  const repositoryName = getBlueprintRepositoryName(blueprint)
  const repositoryBadge = (
    <Badge size="sm" color="neutral" variant="outline" className="gap-1">
      <Icon name="GITHUB" width={12} height={12} />
      {repositoryName}
    </Badge>
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content className="fixed bottom-0 right-0 top-0 z-modal flex w-[940px] max-w-[calc(100vw-32px)] flex-col overflow-hidden border-l border-neutral bg-background focus:outline-none">
          <div className="flex-1 overflow-auto px-6 pb-24 pt-6">
            <div className="mb-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Dialog.Title className="flex items-center gap-3 pr-8 text-2xl font-medium leading-8 text-neutral">
                  <img className="h-8 w-8 rounded" src={blueprint.icon} alt="" aria-hidden="true" />
                  <span>{blueprint.name}</span>
                </Dialog.Title>
                <Dialog.Description className="text-sm leading-5 text-neutral-subtle">
                  {blueprint.description}
                </Dialog.Description>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {repositoryBadge}
                <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                  {provider}
                </Badge>
                {serviceVersion && (
                  <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                    v{serviceVersion}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded border border-neutral bg-surface-neutral p-5">
              <SuspenseQueryBoundary
                resetKeys={[organizationId, blueprint.provider, blueprint.serviceFamily, serviceVersion]}
                title="blueprint details"
              >
                <BlueprintReadme
                  blueprint={blueprint}
                  organizationId={organizationId}
                  serviceVersion={serviceVersion}
                />
              </SuspenseQueryBoundary>
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
            <Button type="button" variant="plain" color="neutral" size="lg" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              color="brand"
              size="lg"
              onClick={() => {
                navigate({
                  to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily',
                  params: {
                    environmentId,
                    organizationId,
                    projectId,
                    provider: blueprint.provider,
                    serviceFamily: blueprint.serviceFamily ?? blueprint.provider,
                  },
                })
              }}
            >
              Deploy blueprint
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
