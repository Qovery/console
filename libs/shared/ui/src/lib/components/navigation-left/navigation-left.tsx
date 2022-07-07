import { Link } from 'react-router-dom'

export interface NavigationLeftProps {
  links: LinkProps[]
  className?: string
}

interface LinkProps {
  title: string
  icon?: string
  url?: string
  onClick?: () => void
  subLinks?: {
    title: string
    url?: string
    onClick?: () => void
  }[]
}

export function NavigationLeft(props: NavigationLeftProps) {
  const { links, className = '' } = props

  const isActive = false

  const linkClassName = `px-2 py-[6px] rounded font-medium cursor-pointer ${
    isActive
      ? 'text-brand-500 bg-brand-50 hover:text-text-600'
      : 'text-text-400 hover:text-text-500 hover:bg-element-light-lighter-300'
  }`

  return (
    <div className={`flex flex-col px-5 ${className}`}>
      {links.map((link, index) =>
        !link.onClick && !link.subLinks && link.url ? (
          <Link key={index} to={link.url} className={linkClassName}>
            {link.title}
          </Link>
        ) : !link.onClick && link.subLinks ? (
          <>
            <span key={index} className={linkClassName}>
              {link.title}
            </span>
            <div className="w-full h-full">
              {link.subLinks.map((subLink, index) => (
                <div key={index} className={`${linkClassName} pl-9`}>
                  {subLink.title}
                </div>
              ))}
            </div>
          </>
        ) : (
          <span key={index} onClick={() => link.onClick} className={linkClassName}>
            {link.title}
          </span>
        )
      )}
    </div>
  )
}

export default NavigationLeft
