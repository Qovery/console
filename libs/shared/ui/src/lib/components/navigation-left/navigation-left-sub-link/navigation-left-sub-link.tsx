import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../../icon/icon'
import { type NavigationLeftLinkProps, linkClassName } from '../navigation-left'

export interface NavigationLeftSubLinkProps {
  linkContent: (link: NavigationLeftLinkProps) => ReactNode
  link: NavigationLeftLinkProps & {
    subLinks: {
      title: string
      url: string
      badge?: string
    }[]
  }
}

export function NavigationLeftSubLink(props: NavigationLeftSubLinkProps) {
  const { link, linkContent } = props
  const { pathname } = useLocation()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    // default open sub links if is active
    link.subLinks.forEach((currentLink) => {
      if (linkClassName(pathname, currentLink.url)?.includes('is-active')) {
        setOpen(true)
      }
    })
  }, [])

  const badge = (text: string) => {
    return (
      <span
        data-testid="sub-link-badge"
        className="rounded-xs rounded-sm bg-brand-500 px-1 text-3xs uppercase text-neutral-50"
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
        className="mt-0.5 flex cursor-pointer select-none items-center justify-between truncate rounded px-3 py-2 text-ssm font-medium text-neutral-350 transition duration-300 ease-out hover:bg-neutral-150 hover:text-neutral-400"
      >
        <span className="flex truncate">{linkContent(link)}</span>
        <Icon
          name="icon-solid-angle-down"
          className={`transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {link.subLinks && (
        <div
          data-testid="sub-links"
          className={`w-full ${open ? 'h-full opacity-100' : 'pointer-events-none hidden opacity-0'}`}
        >
          {link.subLinks.map((subLink, index) => (
            <Link
              data-testid="sub-link"
              key={index}
              to={subLink.url || ''}
              className={`flex ${linkClassName(pathname, subLink.url, subLink.badge)} pl-[37px]`}
            >
              {subLink.title}
              {subLink.badge && badge(subLink.badge)}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default NavigationLeftSubLink
