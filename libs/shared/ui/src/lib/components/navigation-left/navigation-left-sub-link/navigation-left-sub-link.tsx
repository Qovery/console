import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../../icon/icon'
import { NavigationLeftLinkProps } from '../navigation-left'

export interface NavigationLeftSubLinkProps {
  linkContent: (link: NavigationLeftLinkProps) => React.ReactNode
  link: NavigationLeftLinkProps
  linkClassName: (pathname: string, url?: string, badge?: string) => string
}

export function NavigationLeftSubLink(props: NavigationLeftSubLinkProps) {
  const { link, linkClassName, linkContent } = props
  const { pathname } = useLocation()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    // default open sub links if is active
    link.subLinks?.forEach((currentLink) => {
      if (linkClassName(pathname, currentLink.url)?.includes('is-active')) {
        setOpen(true)
      }
    })
  }, [])

  const badge = (text: string) => {
    return (
      <span
        data-testid="sub-link-badge"
        className="bg-brand-500 text-text-100 rounded-xs text-3xs rounded-sm px-1 uppercase"
      >
        {text}
      </span>
    )
  }

  return (
    <>
      <div
        data-testid="link"
        onClick={() => setOpen(!open)}
        className={`justify-between select-none ${linkClassName(pathname, link.url)}`}
      >
        <span className="flex truncate">{linkContent(link)}</span>
        <Icon
          name="icon-solid-angle-down"
          className={`transition-transform ease-out duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {link.subLinks && (
        <div
          data-testid="sub-links"
          className={`w-full ${open ? 'opacity-100 h-full' : 'opacity-0 h-0 pointer-events-none'}`}
        >
          {link.subLinks.map((subLink, index) =>
            subLink.onClick ? (
              <div
                data-testid="sub-link"
                key={index}
                className={`${linkClassName(pathname, subLink.url, subLink.badge)} pl-[37px]`}
                onClick={() => subLink.onClick && subLink.onClick()}
              >
                {subLink.title}
                {subLink.badge && badge(subLink.badge)}
              </div>
            ) : (
              <Link
                data-testid="sub-link"
                key={index}
                to={subLink.url || ''}
                className={`flex ${linkClassName(pathname, subLink.url, subLink.badge)} pl-[37px]`}
              >
                {subLink.title}
                {subLink.badge && badge(subLink.badge)}
              </Link>
            )
          )}
        </div>
      )}
    </>
  )
}

export default NavigationLeftSubLink
