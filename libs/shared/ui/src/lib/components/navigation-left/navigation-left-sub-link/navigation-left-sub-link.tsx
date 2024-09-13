import { type ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../../icon/icon'
import { LinkContent, type NavigationLeftLinkProps, linkClassName } from '../navigation-left'

export interface NavigationLeftSubLinkProps {
  link: NavigationLeftLinkProps & {
    subLinks: {
      title: string
      url: string
      badge?: string
    }[]
  }
  children: ReactNode
}

export function NavigationLeftSubLink({ link, children }: NavigationLeftSubLinkProps) {
  const { pathname } = useLocation()
  const isActivePath = link.subLinks.some((currentLink) =>
    linkClassName(pathname, currentLink.url)?.includes('is-active')
  )
  // By default only the active path is open
  const [open, setOpen] = useState(isActivePath)

  // Auto open the details element, useful when navigating from the home page
  useEffect(() => {
    if (isActivePath) {
      setOpen(true)
    }
  }, [isActivePath])

  return (
    <>
      <div
        data-testid="link"
        onClick={() => setOpen(!open)}
        className="mt-0.5 flex cursor-pointer select-none items-center justify-between truncate rounded px-3 py-2 text-ssm font-medium text-neutral-350 transition duration-300 ease-out hover:bg-neutral-150 hover:text-neutral-400"
      >
        <span className="flex truncate">
          <LinkContent link={link} />
        </span>
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
          {children}
        </div>
      )}
    </>
  )
}

export default NavigationLeftSubLink
