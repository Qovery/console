import { Button, DropdownMenu, LogoIcon } from '@qovery/shared/ui'
import { useTheme } from '../theme-provider/theme-provider'
import { Breadcrumbs } from './breadcrumbs/breadcrumbs'

export function Separator() {
  return (
    <div className="text-surface-neutral-componentActive">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" fill="none" viewBox="0 0 14 15">
        <path
          fill="currentColor"
          d="M10.049.05a.656.656 0 0 1 .358.855l-5.6 13.6a.656.656 0 0 1-1.213-.498l5.6-13.6a.654.654 0 0 1 .855-.357"
        />
      </svg>
    </div>
  )
}

export function Header() {
  const { setTheme } = useTheme()

  return (
    <header className="w-full bg-background-secondary py-4 pl-3 pr-4">
      <div className="flex items-center gap-4">
        <LogoIcon />
        <Separator />
        <Breadcrumbs />
        <div className="ml-auto">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline">Toggle theme</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onClick={() => setTheme('light')}>Light</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => setTheme('dark')}>Dark</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => setTheme('system')}>System</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}

export default Header
