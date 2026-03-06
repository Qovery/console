import { useAuth0 } from '@auth0/auth0-react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useState } from 'react'
import { UserSettingsModal, useUserAccount } from '@qovery/shared/iam/feature'
import { Avatar, DropdownMenu, Icon } from '@qovery/shared/ui'
import { useModal } from '@qovery/shared/ui'
import { type Theme, useTheme } from '../../theme-provider/theme-provider'

const THEMES = [
  { value: 'system', icon: 'desktop' },
  { value: 'light', icon: 'sun-bright' },
  { value: 'dark', icon: 'moon' },
] as const

export function UserMenu() {
  const { theme, setTheme } = useTheme()
  const { logout, user: userToken } = useAuth0()
  const { data: user } = useUserAccount()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { openModal } = useModal()

  const onLogout = async () => {
    await logout()
  }

  const displayName = `${user?.first_name} ${user?.last_name}`
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  const activeIndex = THEMES.findIndex((t) => t.value === theme)
  const indicatorIndex = hoveredIndex ?? activeIndex

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="cursor-pointer select-none rounded-full bg-surface-neutral-component focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-9 focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary">
          <Avatar
            src={userToken?.picture}
            fallback={<span className="text-xs font-medium text-neutral">{initials}</span>}
            size="sm"
            radius="full"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="z-dropdown w-[15rem]">
        <div className="px-3 py-2 text-sm">
          <p className="font-medium text-neutral">{displayName}</p>
          <p className="text-neutral-subtle">{user?.communication_email ?? userToken?.email}</p>
        </div>

        <DropdownMenu.Separator />

        <DropdownMenu.Item onClick={() => openModal({ content: <UserSettingsModal /> })}>
          Profile settings
        </DropdownMenu.Item>

        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium text-neutral">Theme</span>
          <ToggleGroup.Root
            type="single"
            value={theme}
            onValueChange={(val) => val && setTheme(val as Theme)}
            className="relative flex h-6 items-center gap-0.5 rounded-md border border-neutral bg-surface-neutral p-[1px]"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className="absolute h-5 w-5 rounded bg-surface-neutral-component transition-transform duration-150 ease-out"
              style={{ transform: `translateX(${indicatorIndex * 22}px)` }}
            />
            {THEMES.map((t, index) => (
              <ToggleGroup.Item
                key={t.value}
                value={t.value}
                className="relative flex h-5 w-5 cursor-pointer items-center justify-center rounded text-neutral-subtle outline-none transition-colors data-[state=on]:bg-surface-brand-component data-[state=on]:text-brand"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                <Icon iconName={t.icon} iconStyle="regular" className="text-[11px]" />
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        <DropdownMenu.Separator />

        <DropdownMenu.Item>Give feedback</DropdownMenu.Item>

        <DropdownMenu.Item asChild>
          <a
            href="https://www.qovery.com"
            target="_blank"
            rel="noopener noreferrer"
            className="outline-none focus:outline-none"
          >
            Home page
          </a>
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={onLogout}>Sign out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default UserMenu
