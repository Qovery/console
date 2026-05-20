import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { ResourceTreeList } from '@qovery/shared/console-shared'
import { EmptyState, InputSearch, LoaderSpinner } from '@qovery/shared/ui'
import { useTerraformResources } from '../hooks/use-terraform-resources/use-terraform-resources'
import { ResourceDetails } from '../resource-details/resource-details'
import { matchesSearch } from '../utils/matches-search'

export interface TerraformResourcesSectionProps {
  terraformId: string
}

export function TerraformResourcesSection({ terraformId }: TerraformResourcesSectionProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

  const { data, isLoading, error } = useTerraformResources({ terraformId })

  // Auto-select first resource on load; re-select on search changes to keep selection in sync
  useEffect(() => {
    if (!data?.length) return

    if (!selectedResourceId) {
      setSelectedResourceId(data[0].id)
      return
    }

    if (searchQuery) {
      const selectedResource = data.find((r) => r.id === selectedResourceId)
      if (!selectedResource || !matchesSearch(selectedResource, searchQuery)) {
        const firstMatch = data.find((r) => matchesSearch(r, searchQuery))
        if (firstMatch) {
          setSelectedResourceId(firstMatch.id)
        }
      }
    }
  }, [data, searchQuery, selectedResourceId])

  // Get the selected resource (from all resources, not just filtered)
  const selectedResource = useMemo(
    () => data?.find((r) => r.id === selectedResourceId) ?? null,
    [data, selectedResourceId]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderSpinner className="w-6" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon="circle-exclamation"
        title="Failed to load terraform resources"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  // Empty state (no resources at all)
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="wave-pulse"
        title="No infrastructure resources found"
        className="border-none bg-surface-neutral"
        description="Terraform resources will appear here after your first successful deployment."
      />
    )
  }

  return (
    <div className="flex h-page-container flex-col gap-4">
      <div className="flex h-full">
        <div className="flex w-[266px] flex-shrink-0 flex-col gap-4 overflow-x-hidden overflow-y-scroll rounded-r-md border-r border-neutral bg-surface-neutral-subtle p-3">
          <InputSearch placeholder="Search resources…" className="w-full" onChange={setSearchQuery} />

          <div className="min-h-0 flex-1">
            <ResourceTreeList
              resources={data}
              selectedResourceId={selectedResourceId}
              onSelectResource={setSelectedResourceId}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-y-scroll bg-surface-neutral">
          <ResourceDetails resource={selectedResource} />
        </div>
      </div>
    </div>
  )
}
