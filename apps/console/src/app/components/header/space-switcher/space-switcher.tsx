import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { AgentIcon, DropdownMenu, Icon, LogoIcon } from '@qovery/shared/ui'

export type AppSpace = 'agents' | 'infrastructure'

interface SpaceSwitcherProps {
  activeSpace: AppSpace
  organizationId: string
}

const SPACES = [
  {
    id: 'infrastructure',
    label: 'Provision',
    path: '/organization/$organizationId/infrastructure/overview',
  },
  {
    id: 'agents',
    label: 'Agents',
    path: '/organization/$organizationId/agents',
  },
] as const

export function SpaceSwitcher({ activeSpace, organizationId }: SpaceSwitcherProps) {
  const currentSpace = SPACES.find((space) => space.id === activeSpace) ?? SPACES[0]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Switch space, currently ${currentSpace.label}`}
          className="group flex h-9 shrink-0 items-center gap-2 rounded-md border border-neutral bg-surface-neutral px-2 text-sm font-medium text-neutral outline-none transition-colors hover:border-brand-component hover:bg-surface-brand-component focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-text"
        >
          {activeSpace === 'agents' ? (
            <AgentIcon className="h-5 w-5 text-brand" />
          ) : (
            <LogoIcon className="h-5 w-5 text-brand" />
          )}
          <span className="hidden sm:inline">{currentSpace.label}</span>
          <Icon
            iconName="angles-up-down"
            className="text-xs text-neutral-subtle transition-colors group-hover:text-brand"
            aria-hidden="true"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="w-[232px] gap-0">
        {SPACES.map((space) => {
          const isActive = space.id === activeSpace

          return (
            <DropdownMenu.Item
              key={space.id}
              asChild
              className="mb-1 h-auto truncate rounded px-2 py-2 text-sm font-medium text-neutral last:mb-0 data-[highlighted]:bg-surface-brand-subtle data-[highlighted]:text-brand"
            >
              <Link to={space.path} params={{ organizationId }} className="flex w-full min-w-0 items-center gap-3">
                <Icon
                  iconName="check"
                  className={clsx('shrink-0 text-positive', {
                    'opacity-0': !isActive,
                  })}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{space.label}</span>
              </Link>
            </DropdownMenu.Item>
          )
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
