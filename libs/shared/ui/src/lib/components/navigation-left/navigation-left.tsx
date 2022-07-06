import { Link } from 'react-router-dom'

export interface NavigationLeftProps {
  links: LinkProps[]
  className?: string
}

export interface LinkProps {
  title: string
  url: string
  onClick?: () => void
  subLinks?: {
    title: string
    link: string
    onClick?: () => void
  }[]
}

export function NavigationLeft(props: NavigationLeftProps) {
  const { links, className = '' } = props

  const isActive = false

  const linkClassName = `p-2 rounded font-medium ${
    isActive ? 'text-brand-500 bg-brand-50' : 'hover:text-text-500 hover:bg-element-light-lighter-300'
  }`

  return (
    <div className={`flex flex-col px-5 ${className}`}>
      {links.map((link, index) =>
        !link.onClick && !link.subLinks ? (
          <Link key={index} to={link.url} className={linkClassName}>
            {link.title}
          </Link>
        ) : !link.onClick && link.subLinks ? (
          <>
            <span key={index} onClick={() => link.onClick} className={linkClassName}>
              {link.title}
            </span>
            <div>
              {link.subLinks.map((subLink, index) => (
                <span key={index}>{subLink.title}</span>
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
