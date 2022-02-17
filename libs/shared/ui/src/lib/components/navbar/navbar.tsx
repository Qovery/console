import { Link } from 'react-router-dom'
import { INDEX_URL } from '@console/shared/utils'

export function Navbar() {
  return (
    <nav className="flex items-center h-16 w-23 bg-element-light-darker-300">
      <div className="h-full">
        <Link to={INDEX_URL} className="flex items-center px-6 border-r border-element-light-darker-100 h-full">
          <img className="w-[90px]" src="/assets/logos/logo-white.svg" alt="Qovery logo white" />
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
