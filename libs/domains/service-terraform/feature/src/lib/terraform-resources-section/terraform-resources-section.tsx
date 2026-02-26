import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { EmptyState, InputSearch, LoaderSpinner } from '@qovery/shared/ui'
import { useTerraformResources } from '../hooks/use-terraform-resources/use-terraform-resources'
import { ResourceDetails } from '../resource-details/resource-details'
import { ResourceTreeList } from '../resource-tree-list/resource-tree-list'
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
        description="Terraform resources will appear here after your first successful deployment."
      />
    )
  }

  return (
    <div className="flex h-[calc(100dvh-theme(spacing.navbar-height)-4rem)] flex-col gap-4">
      {/* Split panel: Tree list (with search) and Details */}
      <div className="flex h-full">
        {/* Left panel: Search + Resource tree list */}
        <div className="flex w-1/4 flex-shrink-0 flex-col overflow-y-scroll border-r border-neutral">
          {/* Search bar */}
          <div className="flex-shrink-0 p-4 pb-0">
            <InputSearch placeholder="Search resources…" className="w-full" onChange={setSearchQuery} />
          </div>

          {/* Tree list */}
          <div className="flex-1 p-4">
            <ResourceTreeList
              resources={data}
              selectedResourceId={selectedResourceId}
              onSelectResource={setSelectedResourceId}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* Right panel: Resource details */}
        <div className="w-3/4 flex-1 overflow-y-scroll">
          <ResourceDetails resource={selectedResource} />
        </div>
      </div>
    </div>
  )
}
