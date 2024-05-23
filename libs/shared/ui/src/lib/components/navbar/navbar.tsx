import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'

interface NavbarProps {
  className?: string
  logoUrl?: string
  progress?: number
  contentLeft?: ReactElement
}

export function Navbar(props: NavbarProps) {
  const { className, progress = 0, logoUrl, contentLeft } = props

  return (
    <nav className={`w-23 mb-[6px] flex h-16 items-center border-b border-neutral-200 bg-white ${className || ''}`}>
      <div className="relative h-full w-full">
        <div className="flex h-full items-center">
          {logoUrl ? (
            <Link to={logoUrl} className="flex h-full items-center border-r border-neutral-200 px-6">
              <img className="w-[90px]" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />
            </Link>
          ) : (
            <div className="flex h-full items-center border-r border-neutral-200 px-6">
              <img className="w-[90px]" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />
            </div>
          )}
          {contentLeft}
        </div>
        <div
          aria-label="progress-container"
          className={`${progress > 0 ? 'bg-neutral-250' : ''} absolute bottom-[-6px] h-[6px] w-full`}
        >
          <div className="transition-timing h-[6px] bg-brand-500 duration-150" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
