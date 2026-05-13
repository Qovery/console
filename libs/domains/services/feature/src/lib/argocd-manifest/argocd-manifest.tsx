import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { type ArgoCdManagedResource } from '@qovery/domains/services/data-access'
import { ResourceTreeList, type ResourceTreeResource } from '@qovery/shared/console-shared'
import { CodeEditor, EmptyState, Heading, InputSearch, Section } from '@qovery/shared/ui'
import { useArgoCdManifest } from '../hooks/use-argocd-manifest/use-argocd-manifest'

interface ArgoCdManifestResource extends ResourceTreeResource {
  liveState: string
}

export interface ArgoCdManifestProps {
  serviceId: string
}

export function formatLiveState(liveState: string): string {
  try {
    return JSON.stringify(JSON.parse(liveState), null, 2)
  } catch {
    return liveState
  }
}

function getResourceId(resource: ArgoCdManagedResource, index: number): string {
  return `${resource.kind ?? 'Unknown'}:${resource.name ?? 'Unnamed'}:${index}`
}

export function toManifestResources(resources: ArgoCdManagedResource[]): ArgoCdManifestResource[] {
  return resources.map((resource, index) => ({
    id: getResourceId(resource, index),
    resourceType: resource.kind ?? 'Unknown',
    displayName: resource.kind ?? 'Unknown',
    name: resource.name ?? 'Unnamed',
    address: `${resource.kind ?? 'Unknown'}.${resource.name ?? 'Unnamed'}`,
    provider: 'argocd',
    mode: 'managed',
    attributes: {
      kind: resource.kind ?? '',
      name: resource.name ?? '',
    },
    extractedAt: '',
    liveState: resource.liveState ?? '',
  }))
}

function ArgoCdManifestState({
  icon,
  title,
  description,
}: {
  icon: Parameters<typeof EmptyState>[0]['icon']
  title: string
  description: string
}): ReactElement {
  return (
    <div className="container mx-auto flex min-h-page-container flex-col px-4 pt-6">
      <Section className="gap-6">
        <div className="flex shrink-0 flex-col gap-6">
          <Heading>Manifest</Heading>
          <hr className="w-full border-neutral" />
        </div>
        <EmptyState icon={icon} title={title} description={description} />
      </Section>
    </div>
  )
}

export function ArgoCdManifest({ serviceId }: ArgoCdManifestProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const { data, isError } = useArgoCdManifest({ serviceId, suspense: true })

  const resources = useMemo(
    () => toManifestResources(data?.manifest_metadata.managed_resources ?? []),
    [data?.manifest_metadata.managed_resources]
  )

  useEffect(() => {
    if (!selectedResourceId && resources.length > 0) {
      setSelectedResourceId(resources[0].id)
      return
    }

    if (selectedResourceId && !resources.some((resource) => resource.id === selectedResourceId)) {
      setSelectedResourceId(resources[0]?.id ?? null)
    }
  }, [resources, selectedResourceId])

  const selectedResource =
    resources.find((resource) => resource.id === selectedResourceId) ?? (resources.length > 0 ? resources[0] : null)

  if (isError) {
    return (
      <ArgoCdManifestState
        icon="triangle-exclamation"
        title="Unable to load manifest"
        description="The ArgoCD manifest could not be loaded. Please try again later."
      />
    )
  }

  if (resources.length === 0) {
    return (
      <ArgoCdManifestState
        icon="file-lines"
        title="No managed resources"
        description="This ArgoCD service does not expose any managed resource yet."
      />
    )
  }

  return (
    <div className="container mx-auto flex min-h-page-container flex-col px-4 py-6">
      <Section className="min-h-0 flex-1 gap-6">
        <div className="flex shrink-0 flex-col gap-6">
          <Heading>Manifest</Heading>
          <hr className="mb-2 w-full border-neutral" />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-neutral">
          <div className="flex w-[266px] flex-shrink-0 flex-col gap-4 overflow-y-scroll rounded-r-md border-r border-neutral bg-surface-neutral-subtle p-3">
            <InputSearch placeholder="Search…" className="w-full" onChange={setSearchQuery} />

            <div className="min-h-0 flex-1">
              <ResourceTreeList
                resources={resources}
                selectedResourceId={selectedResource?.id ?? null}
                onSelectResource={setSelectedResourceId}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1">
            <CodeEditor
              language="json"
              value={selectedResource ? formatLiveState(selectedResource.liveState) : ''}
              readOnly
              height="100%"
              options={{ scrollBeyondLastLine: false, wordWrap: 'off' }}
            />
          </div>
        </div>
      </Section>
    </div>
  )
}

export default ArgoCdManifest
