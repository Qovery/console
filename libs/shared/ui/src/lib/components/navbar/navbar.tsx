import { Link } from 'react-router-dom'
import { OVERVIEW_URL } from '@console/shared/utils'
interface NavbarProps {
  className?: string
  logoUrl?: string
  progress?: number
  contentLeft?: React.ReactElement
}

export function Navbar(props: NavbarProps) {
  const { className, progress = 0, logoUrl = OVERVIEW_URL, contentLeft } = props

  return (
    <nav
      className={`flex items-center h-16 w-23 bg-white border-b border-element-light-lighter-400 mb-[6px] ${
        className || ''
      }`}
    >
      <div className="relative h-full w-full">
        <div className="h-full flex items-center">
          <Link to={logoUrl} className="flex items-center px-6 border-r border-element-light-lighter-400 h-full">
            <img className="w-[90px]" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />
          </Link>
          {contentLeft && contentLeft}
        </div>
        <div className={`${progress > 0 ? 'bg-element-light-lighter-500' : ''} w-full h-[6px] absolute bottom-[-6px]`}>
          <div className="h-[6px] bg-brand-500 transition-timing duration-150" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
