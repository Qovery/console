import { type ArgocdManagedResource } from 'qovery-typescript-axios'
import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { ResourceTreeList, type ResourceTreeResource } from '@qovery/shared/console-shared'
import {
  CodeEditor,
  EmptyState,
  Heading,
  InputSearch,
  LoaderSpinner,
  Section,
  SegmentedControl,
} from '@qovery/shared/ui'
import { useArgoCdManifest } from '../hooks/use-argocd-manifest/use-argocd-manifest'

type ManifestStateMode = 'live' | 'target'

interface ArgoCdManifestResource extends ResourceTreeResource {
  liveState: string
  targetState: string
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

function getResourceId(resource: ArgocdManagedResource): string {
  return `${resource.kind ?? 'Unknown'}:${resource.name ?? 'Unnamed'}`
}

export function toManifestResources(resources: ArgocdManagedResource[]): ArgoCdManifestResource[] {
  return resources.map((resource) => ({
    id: getResourceId(resource),
    resourceType: resource.kind ?? 'Unknown',
    displayName: resource.kind ?? 'Unknown',
    name: resource.name ?? 'Unnamed',
    address: `${resource.kind ?? 'Unknown'}.${resource.name ?? 'Unnamed'}`,
    attributes: {
      kind: resource.kind ?? '',
      name: resource.name ?? '',
    },
    liveState: resource.liveState ?? '',
    targetState: resource.targetState ?? '',
  }))
}

function getManifestState(resource: ArgoCdManifestResource | null, mode: ManifestStateMode): string {
  if (!resource) return ''
  return mode === 'live' ? resource.liveState : resource.targetState
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
  const [stateMode, setStateMode] = useState<ManifestStateMode>('live')
  const { data, isError, isLoading } = useArgoCdManifest({ serviceId })

  const resources = useMemo(
    () => toManifestResources(data?.manifest_metadata?.managed_resources ?? []),
    [data?.manifest_metadata?.managed_resources]
  )
  const stateResources = useMemo(
    () => resources.filter((resource) => getManifestState(resource, stateMode)),
    [resources, stateMode]
  )

  useEffect(() => {
    if (!selectedResourceId && stateResources.length > 0) {
      setSelectedResourceId(stateResources[0].id)
      return
    }

    if (selectedResourceId && !stateResources.some((resource) => resource.id === selectedResourceId)) {
      setSelectedResourceId(stateResources[0]?.id ?? null)
    }
  }, [stateResources, selectedResourceId])

  const selectedResource =
    stateResources.find((resource) => resource.id === selectedResourceId) ??
    (stateResources.length > 0 ? stateResources[0] : null)

  if (isError) {
    return (
      <ArgoCdManifestState
        icon="triangle-exclamation"
        title="Unable to load manifest"
        description="The ArgoCD manifest could not be loaded. Please try again later."
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-page-container flex-1 items-center justify-center bg-background">
        <LoaderSpinner />
      </div>
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
          <div className="flex w-[266px] flex-shrink-0 flex-col gap-2 overflow-x-hidden overflow-y-scroll rounded-r-md border-r border-neutral bg-surface-neutral-subtle p-3 pt-2">
            <SegmentedControl.Root
              value={stateMode}
              onValueChange={(value) => setStateMode(value as ManifestStateMode)}
              className="h-7 w-full text-xs"
            >
              <SegmentedControl.Item value="live" className="border-transparent px-2">
                Live
              </SegmentedControl.Item>
              <SegmentedControl.Item value="target" className="border-transparent px-2">
                Target
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            <hr className="-mx-3 border-neutral" />
            <InputSearch placeholder="Search…" className="w-full" onChange={setSearchQuery} />

            <div className="min-h-0 flex-1">
              <ResourceTreeList
                resources={stateResources}
                selectedResourceId={selectedResource?.id ?? null}
                onSelectResource={setSelectedResourceId}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <CodeEditor
              language="json"
              value={formatLiveState(getManifestState(selectedResource, stateMode))}
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
