import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { type TerraformResource } from '@qovery/domains/service-terraform/data-access'
import { EmptyState, Icon, TreeView } from '@qovery/shared/ui'
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
    return <EmptyState title="No resources found" description="No terraform resources available." />
  }

  if (searchQuery && !hasMatches) {
    return <EmptyState title="No resources match" description={`No resources found for "${searchQuery}"`} />
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-4">
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
                      'w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm transition-colors flex items-center gap-2'
                    if (isSelected) {
                      return `${base} bg-neutral-200 font-medium text-neutral-400`
                    }
                    if (matches) {
                      return `${base} text-neutral-350 hover:bg-neutral-150`
                    }
                    return `${base} text-neutral-250 hover:bg-neutral-150/50`
                  }

                  return (
                    <li key={resource.id}>
                      <button
                        type="button"
                        onClick={() => onSelectResource(resource.id)}
                        className={getButtonClassName()}
                        title={!matches ? 'Does not match search query' : undefined}
                      >
                        <Icon iconName="box" className="flex-shrink-0 text-xs" />
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
