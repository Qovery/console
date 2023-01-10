import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../../icon/icon'
import { NavigationLeftLinkProps } from '../navigation-left'

export interface NavigationLeftSubLinkProps {
  linkContent: (link: NavigationLeftLinkProps) => React.ReactNode
  link: NavigationLeftLinkProps
  linkClassName: (pathname: string, url?: string) => string
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

  return (
    <>
      <div
        data-testid="link"
        onClick={() => setOpen(!open)}
        className={`flex justify-between select-none ${linkClassName(pathname, link.url)}`}
      >
        <span className="truncate">{linkContent(link)}</span>
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
                className={`${linkClassName(pathname, subLink.url)} pl-[37px]`}
                onClick={() => subLink.onClick && subLink.onClick()}
              >
                {subLink.title}
              </div>
            ) : (
              <Link
                data-testid="sub-link"
                key={index}
                to={subLink.url || ''}
                className={`flex ${linkClassName(pathname, subLink.url)} pl-[37px]`}
              >
                {subLink.title}
              </Link>
            )
          )}
        </div>
      )}
    </>
  )
}

export default NavigationLeftSubLink
