import { IconEnum } from '@qovery/shared/enums'
import { Icon, InputSearch, Tooltip } from '@qovery/shared/ui'

type LayerStatus = 'disabled' | 'success' | 'warning'

export interface ClusterProfileSidebarItem {
  id: string
  key: string
  label: string
}

export interface ClusterProfileSidebarLayer {
  id: string
  label: string
  status: LayerStatus
  items: readonly ClusterProfileSidebarItem[]
}

interface LayerSectionRowProps {
  section: ClusterProfileSidebarLayer
  selectedSectionId?: string
  selectedItemId?: string
  onSelectSection: (sectionId: string) => void
  onSelectItem: (itemId: string) => void
}

function LayerIcon({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`size-3.5 shrink-0 bg-current [mask-image:url('/assets/sidebar-test/layer.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${className}`}
    />
  )
}

export function ClusterProfileItemIcon() {
  return <Icon name={IconEnum.HELM_OFFICIAL} width="14" height="14" className="shrink-0" aria-hidden="true" />
}

function LayerSectionRow({
  section,
  selectedSectionId,
  selectedItemId,
  onSelectSection,
  onSelectItem,
}: LayerSectionRowProps) {
  const isDisabled = section.status === 'disabled'
  const isSelected = !isDisabled && section.id === selectedSectionId
  const disabledReason =
    section.id === 'infrastructure'
      ? 'This layer is currently skipped'
      : section.id === 'qovery-stack'
        ? 'These values are currently managed by Qovery'
        : undefined

  return (
    <Tooltip content={disabledReason ?? ''} disabled={!disabledReason} side="right">
      <li className={isSelected ? 'bg-surface-neutral-component' : ''}>
        <button
          type="button"
          disabled={isDisabled}
          aria-current={isSelected && !selectedItemId ? 'page' : undefined}
          className={`focus-visible:ring-brand flex h-8 w-full items-center gap-1.5 rounded px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:text-neutral-disabled ${
            isDisabled
              ? ''
              : `${isSelected ? 'text-neutral' : 'text-neutral-subtle'} hover:bg-surface-neutral-component hover:text-neutral`
          }`}
          onClick={() => {
            const firstItem = section.items[0]
            if (firstItem) {
              onSelectItem(firstItem.id)
            } else {
              onSelectSection(section.id)
            }
          }}
        >
          <LayerIcon />
          <span className="truncate">{section.label}</span>
          {section.status === 'warning' ? (
            <Tooltip content="Complete the required information before deploying">
              <span
                role="img"
                aria-label="Complete the required information before deploying"
                className="ml-auto flex size-3.5 shrink-0 items-center justify-center"
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-surface-brand-solid" />
              </span>
            </Tooltip>
          ) : null}
          {isDisabled ? (
            <Icon iconName="circle-minus" iconStyle="regular" className="ml-auto shrink-0 text-sm" />
          ) : null}
        </button>

        {section.items.map((item) => {
          const isItemSelected = isSelected && item.id === selectedItemId

          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              aria-current={isItemSelected ? 'page' : undefined}
              className={`focus-visible:ring-brand group flex h-7 w-full items-center gap-1.5 px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:text-neutral-disabled ${
                isDisabled
                  ? ''
                  : isItemSelected
                    ? 'text-neutral'
                    : 'text-neutral-subtle hover:bg-surface-neutral-component hover:text-neutral'
              }`}
              onClick={() => onSelectItem(item.id)}
            >
              <span aria-hidden="true" className="relative h-7 w-3.5 shrink-0">
                <span
                  className={`absolute inset-y-0 left-1/2 -translate-x-1/2 border-l ${
                    isDisabled
                      ? 'border-neutral'
                      : isItemSelected
                        ? 'border-neutralInvert'
                        : 'border-neutral group-hover:border-neutralInvert'
                  }`}
                />
              </span>
              <span className="flex min-w-0 items-center gap-1.5 py-1">
                <ClusterProfileItemIcon />
                <span className="truncate">{item.label}</span>
              </span>
            </button>
          )
        })}
      </li>
    </Tooltip>
  )
}

export interface ClusterProfileSidebarProps {
  // Layers already filtered by the search.
  layers: readonly ClusterProfileSidebarLayer[]
  search: string
  selectedSectionId?: string
  selectedItemId?: string
  isLoading?: boolean
  isError?: boolean
  onSearchChange: (search: string) => void
  onSelectSection: (sectionId: string) => void
  onSelectItem: (itemId: string) => void
}

export function ClusterProfileSidebar({
  layers,
  search,
  selectedSectionId,
  selectedItemId,
  isLoading = false,
  isError = false,
  onSearchChange,
  onSelectSection,
  onSelectItem,
}: ClusterProfileSidebarProps) {
  const showEmptyState = !isLoading && !isError && layers.length === 0

  return (
    <aside aria-label="Cluster layers" className="hidden w-[272px] shrink-0 flex-col bg-background-secondary lg:flex">
      <div className="p-3">
        <InputSearch
          ariaLabel="Search layers"
          placeholder="Search…"
          customSize="h-7 text-ssm"
          defaultValue={search}
          onChange={onSearchChange}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <h2 className="flex h-8 shrink-0 items-center px-3 text-sm font-medium">Layers</h2>
        <nav aria-label="Layers" className="min-h-0 flex-1 overflow-y-auto">
          <ul>
            {isLoading ? <p className="px-3 py-1 text-xs text-neutral-subtle">Loading layers...</p> : null}
            {isError ? <p className="px-3 py-1 text-xs text-negative">Unable to load layers.</p> : null}
            {showEmptyState ? (
              <p className="px-3 py-1 text-ssm text-neutral-subtle">
                No results found. Review your search or applied filters.
              </p>
            ) : null}
            {!isLoading && !isError
              ? layers.map((section) => (
                  <LayerSectionRow
                    key={section.id}
                    section={section}
                    selectedSectionId={selectedSectionId}
                    selectedItemId={selectedItemId}
                    onSelectSection={onSelectSection}
                    onSelectItem={onSelectItem}
                  />
                ))
              : null}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
