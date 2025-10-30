import { LogoIcon } from '@qovery/shared/ui'

export function Header() {
  return (
    <header className="w-full bg-background-secondary py-4 pl-3 pr-4">
      <div className="container flex items-center gap-4">
        <LogoIcon />
        <div>
          <span className="text-neutral-disabled">/</span>
        </div>
      </div>
    </header>
  )
}

export default Header
