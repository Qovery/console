import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { EmptyState, Icon, InputText, LoaderSpinner } from '@qovery/shared/ui'
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
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Icon name="icon-solid-circle-exclamation" className="text-4xl text-red-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-400">Failed to load terraform resources</p>
          <p className="text-xs text-neutral-350">{error instanceof Error ? error.message : 'An error occurred'}</p>
        </div>
      </div>
    )
  }

  // Empty state (no resources at all)
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No infrastructure resources found"
        description="Terraform resources will appear here after your first successful deployment."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Split panel: Tree list (with search) and Details */}
      <div className="flex min-h-0 gap-4 overflow-hidden rounded border border-neutral-250 bg-neutral-100">
        {/* Left panel: Search + Resource tree list */}
        <div className="flex w-1/3 flex-shrink-0 flex-col border-r border-neutral-250">
          {/* Search bar */}
          <div className="flex-shrink-0 border-b border-neutral-250 p-4 pb-3">
            <div className="relative">
              <InputText
                label="Search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-350 transition-colors hover:text-neutral-400"
                  title="Clear search"
                >
                  <Icon name="icon-solid-times" className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Tree list */}
          <div className="flex-1 overflow-hidden p-4">
            <ResourceTreeList
              resources={data}
              selectedResourceId={selectedResourceId}
              onSelectResource={setSelectedResourceId}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* Right panel: Resource details */}
        <div className="w-2/3 flex-1 overflow-hidden p-4">
          <ResourceDetails resource={selectedResource} />
        </div>
      </div>
    </div>
  )
}
