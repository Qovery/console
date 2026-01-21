import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { type TerraformResource } from '@qovery/domains/service-terraform/data-access'
import { Icon, TreeView } from '@qovery/shared/ui'
import { matchesSearch } from '../utils/matches-search'

export interface ResourceTreeListProps {
  resources: TerraformResource[]
  selectedResourceId: string | null
  onSelectResource: (resourceId: string) => void
  searchQuery: string
}

interface GroupedResources {
  resourceType: string
  displayName: string
  resources: TerraformResource[]
}

function groupResourcesByType(resources: TerraformResource[]): GroupedResources[] {
  const groups = new Map<string, TerraformResource[]>()

  for (const resource of resources) {
    const list = groups.get(resource.resourceType) ?? []
    list.push(resource)
    groups.set(resource.resourceType, list)
  }

  return Array.from(groups.entries())
    .map(([type, groupItems]) => ({
      resourceType: type,
      displayName: groupItems[0].displayName,
      resources: groupItems.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function ResourceTreeList({
  resources,
  selectedResourceId,
  onSelectResource,
  searchQuery,
}: ResourceTreeListProps): ReactElement {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  // Always show all resources, but mark which ones match the search
  const resourceMatchMap = useMemo(() => {
    if (!searchQuery) return new Map(resources.map((r) => [r.id, true]))
    return new Map(resources.map((r) => [r.id, matchesSearch(r, searchQuery)]))
  }, [resources, searchQuery])

  const groupedResources = useMemo(() => {
    return groupResourcesByType(resources)
  }, [resources])

  useEffect(() => {
    if (expandedGroups.length === 0 && groupedResources.length > 0) {
      setExpandedGroups(groupedResources.map((group) => group.resourceType))
    }
  }, [expandedGroups.length, groupedResources])

  const hasMatches = Array.from(resourceMatchMap.values()).some((match) => match)

  if (resources.length === 0) {
    return (
      <div className="px-3 pb-8 pt-6 text-center">
        <Icon iconName="wave-pulse" className="text-neutral-350" />
        <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
      </div>
    )
  }

  if (searchQuery && !hasMatches) {
    return (
      <div className="px-3 py-8 text-center">
        <Icon iconName="search" className="text-neutral-350" />
        <p className="mt-1 text-xs font-medium text-neutral-350">No resources match</p>
        <p className="mt-1 text-xs text-neutral-350">No resources found for ${searchQuery}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      <TreeView.Root type="multiple" value={expandedGroups} onValueChange={setExpandedGroups}>
        {groupedResources.map((group) => (
          <TreeView.Item key={group.resourceType} value={group.resourceType}>
            <TreeView.Trigger>
              <span className="flex-1 text-sm">
                {group.displayName}
                <span className="ml-2 text-xs text-neutral-350">({group.resources.length})</span>
              </span>
            </TreeView.Trigger>
            <TreeView.Content>
              <ul className="space-y-1">
                {group.resources.map((resource) => {
                  const matches = resourceMatchMap.get(resource.id) ?? true
                  const isSelected = selectedResourceId === resource.id

                  function getButtonClassName(): string {
                    const base =
                      'w-full cursor-pointer rounded h-8 px-2 gap-2 text-sm transition-colors flex items-center mb-1'
                    if (isSelected) {
                      return `${base} bg-brand-50 text-brand-500`
                    }
                    if (matches) {
                      return `${base} text-neutral-350 hover:bg-neutral-100`
                    }
                    return `${base} text-neutral-250 hover:bg-neutral-100`
                  }

                  return (
                    <li key={resource.id}>
                      <button
                        type="button"
                        onClick={() => onSelectResource(resource.id)}
                        className={getButtonClassName()}
                        title={!matches ? 'Does not match search query' : undefined}
                      >
                        <Icon iconName="file" className="fa-regular text-xs" />
                        <span className="truncate">{resource.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </TreeView.Content>
          </TreeView.Item>
        ))}
      </TreeView.Root>
    </div>
  )
}
