import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Icon, InputSearch, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type Theme, useTheme } from '../app/components/theme-provider/theme-provider'

type LayerStatus = 'disabled' | 'success' | 'warning'
type LayerItemIcon = 'alloy' | 'helm' | 'loki'

interface LayerItem {
  id: string
  label: string
  icon: LayerItemIcon
}

interface LayerSection {
  id: string
  label: string
  status: LayerStatus
  items: LayerItem[]
  disabledReason?: string
  hasSectionContent?: boolean
}

const THEMES = [
  { value: 'system', label: 'System', icon: 'desktop' },
  { value: 'light', label: 'Light', icon: 'sun-bright' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
] as const

const LAYER_SECTIONS: LayerSection[] = [
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    status: 'disabled',
    items: [],
    disabledReason: 'This layer is currently skipped',
  },
  {
    id: 'qovery-stack',
    label: 'Qovery stack',
    status: 'disabled',
    disabledReason: 'These values are currently managed by Qovery',
    items: [
      { id: 'cluster-agent', label: 'Cluster agent', icon: 'helm' },
      { id: 'shell-agent', label: 'Shell agent', icon: 'helm' },
      { id: 'priority-class', label: 'Qovery priority class', icon: 'helm' },
    ],
  },
  {
    id: 'log-infra',
    label: 'Log infra',
    status: 'success',
    items: [
      { id: 'loki', label: 'Loki', icon: 'loki' },
      { id: 'alloy', label: 'Alloy', icon: 'alloy' },
    ],
  },
  {
    id: 'gateway-api',
    label: 'Gateway API',
    status: 'warning',
    hasSectionContent: true,
    items: [
      { id: 'envoy-gateway-crd', label: 'Envoy gateway CRD', icon: 'helm' },
      { id: 'envoy-gateway', label: 'Envoy gateway', icon: 'helm' },
      { id: 'gateway-class', label: 'Qovery gateway class', icon: 'helm' },
      { id: 'cluster-gateway', label: 'Qovery cluster gateway', icon: 'helm' },
    ],
  },
  {
    id: 'dns-certificates',
    label: 'DNS certificates',
    status: 'success',
    items: [
      { id: 'cert-manager', label: 'Cert manager', icon: 'helm' },
      { id: 'dns-cert-manager-webhook', label: 'Qovery cert manager webhook', icon: 'helm' },
      { id: 'dns-cert-manager-configs', label: 'Cert manager configs', icon: 'helm' },
      { id: 'dns-external-dns', label: 'External DNS', icon: 'helm' },
      { id: 'dns-external-dns-secret', label: 'External DNS secret', icon: 'helm' },
    ],
  },
]

interface MaskIconProps {
  asset: 'helm' | 'layer'
  className?: string
}

function MaskIcon({ asset, className = '' }: MaskIconProps) {
  const maskClass =
    asset === 'layer'
      ? "[mask-image:url('/assets/sidebar-test/layer.svg')]"
      : "[mask-image:url('/assets/sidebar-test/helm.svg')]"

  return (
    <span
      aria-hidden="true"
      className={`size-3.5 shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${maskClass} ${className}`}
    />
  )
}

function LayerItemGlyph({ icon }: { icon: LayerItemIcon }) {
  if (icon === 'helm') return <MaskIcon asset="helm" />

  return (
    <img
      src={`/assets/sidebar-test/${icon}.png`}
      alt=""
      aria-hidden="true"
      className="size-3.5 shrink-0 object-contain"
    />
  )
}

interface LayerSectionRowProps {
  section: LayerSection
  selectedSectionId: string
  selectedItemId?: string
  onSelectSection: (sectionId: string) => void
  onSelectItem: (sectionId: string, itemId: string) => void
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

  return (
    <Tooltip content={section.disabledReason ?? ''} disabled={!section.disabledReason} side="right">
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
          onClick={() =>
            section.hasSectionContent
              ? onSelectSection(section.id)
              : section.items[0] && onSelectItem(section.id, section.items[0].id)
          }
        >
          <MaskIcon asset="layer" />
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
              onClick={() => onSelectItem(section.id, item.id)}
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
                <LayerItemGlyph icon={item.icon} />
                <span className="truncate">{item.label}</span>
              </span>
            </button>
          )
        })}
      </li>
    </Tooltip>
  )
}

function SidebarTest() {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('log-infra')
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>('loki')

  useDocumentTitle('Sidebar interaction test')

  const query = search.trim().toLocaleLowerCase()
  const filteredSections = query
    ? LAYER_SECTIONS.flatMap((section) => {
        const sectionMatches = section.label.toLocaleLowerCase().includes(query)
        const items = sectionMatches
          ? section.items
          : section.items.filter((item) => item.label.toLocaleLowerCase().includes(query))

        return sectionMatches || items.length > 0 ? [{ ...section, items }] : []
      })
    : LAYER_SECTIONS

  const selectItem = (sectionId: string, itemId: string) => {
    setSelectedSectionId(sectionId)
    setSelectedItemId(itemId)
  }

  const selectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setSelectedItemId(undefined)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-neutral">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral bg-background-secondary px-6 py-4">
        <div>
          <h1 className="text-base font-medium">Sidebar interaction test</h1>
          <p className="mt-1 text-sm text-neutral-subtle">
            Layer headings open their own content when available, otherwise their first subsection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Theme</span>
          <ToggleGroup.Root
            type="single"
            value={theme}
            aria-label="Theme"
            className="flex items-center gap-1 rounded-md border border-neutral bg-surface-neutral p-1"
            onValueChange={(value) => value && setTheme(value as Theme)}
          >
            {THEMES.map(({ value, label, icon }) => (
              <ToggleGroup.Item
                key={value}
                value={value}
                aria-label={`${label} theme`}
                className="focus-visible:ring-brand flex h-7 items-center gap-2 rounded px-2 text-sm text-neutral-subtle outline-none hover:bg-surface-neutral-component hover:text-neutral focus-visible:ring-2 data-[state=on]:bg-surface-brand-component data-[state=on]:text-brand"
              >
                <Icon iconName={icon} iconStyle="regular" className="text-sm" />
                {label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center p-6 md:p-12">
        <aside
          aria-label="Cluster layers"
          className="flex h-[720px] max-h-[calc(100vh-10rem)] w-[272px] flex-col overflow-hidden rounded-lg border border-neutral bg-background-secondary"
        >
          <div className="p-3">
            <InputSearch
              placeholder="Search…"
              customSize="h-7 text-ssm"
              onChange={setSearch}
              isEmpty={filteredSections.length === 0}
              emptyContent={<p className="px-3 py-6 text-center text-xs text-neutral-subtle">No matching layer</p>}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className="flex h-8 shrink-0 items-center px-3 text-sm font-medium">Layers</h2>
            <nav aria-label="Layers" className="min-h-0 flex-1 overflow-y-auto">
              <ul>
                {filteredSections.map((section) => (
                  <LayerSectionRow
                    key={section.id}
                    section={section}
                    selectedSectionId={selectedSectionId}
                    selectedItemId={selectedItemId}
                    onSelectSection={selectSection}
                    onSelectItem={selectItem}
                  />
                ))}
              </ul>
            </nav>
          </div>

          <footer className="flex shrink-0 items-center justify-between bg-background-secondary p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Qovery operator</span>
              <Icon iconName="circle-check" iconStyle="regular" className="text-sm text-positive" />
            </div>
            <button
              type="button"
              aria-label="Qovery operator information"
              className="focus-visible:ring-brand flex h-6 w-6 items-center justify-center rounded border border-neutral bg-surface-neutral-component text-neutral-subtle outline-none hover:bg-surface-neutral-componentHover hover:text-neutral focus-visible:ring-2"
            >
              <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
            </button>
          </footer>
        </aside>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/sidebar-test')({
  component: SidebarTest,
})
