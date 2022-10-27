import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../icon/icon'
import NavigationLeftSubLink from './navigation-left-sub-link/navigation-left-sub-link'

export interface NavigationLeftProps {
  links: NavigationLeftLinkProps[]
  title?: string
  className?: string
}

export interface NavigationLeftLinkProps {
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

export const linkClassName = (pathname: string, url?: string) =>
  `py-2 px-3 text-ssm rounded font-medium cursor-pointer mt-0.5 transition ease-out duration-300 truncate ${
    url === pathname
      ? 'is-active text-brand-500 bg-brand-50 hover:text-brand-600 hover:bg-brand-100'
      : 'text-text-400 hover:text-text-500 hover:bg-element-light-lighter-300'
  }`

export function NavigationLeft(props: NavigationLeftProps) {
  const { title, links, className = '' } = props

  const { pathname } = useLocation()

  const linkContent = (link: NavigationLeftLinkProps) => (
    <>
      {link.icon && <Icon name={link.icon} className="mr-3" />}
      {link.title}
    </>
  )

  return (
    <div className={`flex flex-col px-5 ${className}`}>
      {title && <span className="text-text-400 uppercase text-xxs font-bold mb-4 pl-3">{title}</span>}
      {links.map((link, index) =>
        !link.onClick && !link.subLinks && link.url ? (
          <Link data-testid="link" key={index} to={link.url} className={linkClassName(link.url, pathname)}>
            {linkContent(link)}
          </Link>
        ) : !link.onClick && link.subLinks ? (
          <NavigationLeftSubLink key={index} link={link} linkClassName={linkClassName} linkContent={linkContent} />
        ) : (
          <span
            data-testid="link"
            key={index}
            onClick={link.onClick}
            className={linkClassName(link.url || '', pathname)}
          >
            {linkContent(link)}
          </span>
        )
      )}
    </div>
  )
}

export default NavigationLeft
