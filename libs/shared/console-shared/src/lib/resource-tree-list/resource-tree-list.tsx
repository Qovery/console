import clsx from 'clsx'
import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { Accordion, Icon } from '@qovery/shared/ui'

export interface ResourceTreeResource {
  id: string
  resourceType: string
  name: string
  address: string
  attributes: Record<string, unknown>
  displayName: string
}

export interface ResourceTreeListProps {
  resources: ResourceTreeResource[]
  selectedResourceId: string | null
  onSelectResource: (resourceId: string) => void
  searchQuery: string
}

interface GroupedResources {
  resourceType: string
  displayName: string
  resources: ResourceTreeResource[]
}

function matchesSearch(resource: ResourceTreeResource, query: string): boolean {
  const lowerQuery = query.toLowerCase()

  if (resource.name.toLowerCase().includes(lowerQuery)) return true
  if (resource.resourceType.toLowerCase().includes(lowerQuery)) return true
  if (resource.displayName.toLowerCase().includes(lowerQuery)) return true
  if (resource.address.toLowerCase().includes(lowerQuery)) return true

  const attributeKeys = Object.keys(resource.attributes)
  if (attributeKeys.some((key) => key.toLowerCase().includes(lowerQuery))) return true

  const attributeValues = Object.values(resource.attributes).map((value) => String(value))
  if (attributeValues.some((value) => value.toLowerCase().includes(lowerQuery))) return true

  return false
}

function groupResourcesByType(resources: ResourceTreeResource[]): GroupedResources[] {
  const groups = new Map<string, ResourceTreeResource[]>()

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

  const resourceMatchMap = useMemo(() => {
    if (!searchQuery) return new Map(resources.map((resource) => [resource.id, true]))
    return new Map(resources.map((resource) => [resource.id, matchesSearch(resource, searchQuery)]))
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
        <Icon iconName="wave-pulse" className="text-neutral" />
        <p className="mt-1 text-xs font-medium text-neutral">No result for this search</p>
      </div>
    )
  }

  if (searchQuery && !hasMatches) {
    return (
      <div className="px-3 py-8 text-center">
        <Icon iconName="search" className="text-neutral" />
        <p className="mt-1 text-xs font-medium text-neutral">No resources match</p>
        <p className="mt-1 text-xs text-neutral-subtle">No resources found for: {searchQuery}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      <Accordion.Root type="multiple" value={expandedGroups} onValueChange={setExpandedGroups}>
        {groupedResources.map((group) => (
          <Accordion.Item key={group.resourceType} value={group.resourceType} className="overflow-hidden">
            <Accordion.Trigger
              className="h-8 min-h-0 w-full gap-1 bg-transparent pl-1 pr-1.5 text-left text-sm text-neutral hover:bg-surface-neutral-subtle"
              iconClassName="order-3 ml-auto text-xs"
            >
              <span className="flex h-6 w-6 items-center justify-center">
                <Icon iconName="folder" className="text-neutral-subtle" />
              </span>
              <span className="min-w-0 flex-1 truncate">{group.displayName}</span>
            </Accordion.Trigger>
            <Accordion.Content className="bg-transparent">
              <ul className="space-y-1">
                {group.resources.map((resource) => {
                  const isSelected = selectedResourceId === resource.id

                  return (
                    <li key={resource.id}>
                      <button
                        type="button"
                        onClick={() => onSelectResource(resource.id)}
                        className={clsx(
                          'mb-1 flex h-8 w-full cursor-pointer items-center gap-1 rounded-md pl-6 pr-1.5 text-left text-sm transition-colors',
                          isSelected ? 'bg-surface-brand-component text-brand' : 'hover:bg-surface-neutral-subtle'
                        )}
                      >
                        <span className="flex h-6 w-6 items-center justify-center">
                          <Icon iconName="file" className={clsx(isSelected ? 'text-brand' : 'text-neutral-subtle')} />
                        </span>
                        <span className="min-w-0 truncate">{resource.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  )
}
