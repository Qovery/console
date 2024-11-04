import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Link, useLocation } from 'react-router-dom'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'
import NavigationLeftSubLink from './navigation-left-sub-link/navigation-left-sub-link'

export interface NavigationLeftProps {
  links: NavigationLeftLinkProps[]
  title?: string
  link?: {
    title: string
    onClick: () => void
  }
  className?: string
}

export type NavigationLeftLinkProps = {
  title: string
} & (
  | {
      url: string
    }
  | {
      subLinks: {
        title: string
        url: string
        badge?: string
      }[]
    }
) &
  (
    | {
        /**
         * @deprecated please use `iconName` instead `icon`
         */
        icon?: string
        iconName?: never
      }
    | {
        iconName?: IconName
        icon?: never
      }
  )

export const linkClassName = (pathname: string, url?: string, badge?: string) =>
  `flex items-center py-2 px-3 text-ssm rounded font-medium cursor-pointer mt-0.5 transition ease-out duration-300 truncate ${
    url === pathname
      ? 'is-active text-brand-500 bg-brand-50 hover:text-brand-600 hover:bg-brand-100'
      : 'text-neutral-350 hover:text-neutral-400 hover:bg-neutral-150'
  } ${badge ? 'justify-between' : ''} `

export function LinkContent({ link }: { link: NavigationLeftLinkProps }) {
  return (
    <>
      {(link.icon || link.iconName) && (
        <div className="mr-4 flex items-center">
          {link.iconName ? (
            // Prepared for migration to use iconName instead of name
            <Icon iconName={link.iconName as IconName} className="inline-block w-3 text-sm" />
          ) : (
            <Icon name={link.icon} className="inline-block w-4" />
          )}
        </div>
      )}
      {link.title}
    </>
  )
}

export function NavigationLeft(props: NavigationLeftProps) {
  const { title, links, link, className = '' } = props

  const { pathname } = useLocation()

  return (
    <div className={twMerge('flex flex-col px-5', className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          {title && <span className="pl-3 text-2xs font-bold uppercase text-neutral-350">{title}</span>}
          {link && (
            <span className="link cursor-pointer text-sm font-medium text-brand-500" onClick={() => link.onClick()}>
              {link.title}
              <Icon iconName="circle-plus" iconStyle="regular" className="ml-1" />
            </span>
          )}
        </div>
      )}
      {links.map((link) =>
        'url' in link ? (
          <Link data-testid="link" key={link.url} to={link.url} className={linkClassName(link.url, pathname)}>
            <LinkContent link={link} />
          </Link>
        ) : (
          <NavigationLeftSubLink key={link.title} link={link}>
            {link.subLinks.map((subLink) => (
              <Link
                data-testid="sub-link"
                key={subLink.url}
                to={subLink.url || ''}
                className={`flex ${linkClassName(pathname, subLink.url, subLink.badge)} pl-[37px]`}
              >
                {subLink.title}
                {subLink.badge && (
                  <span
                    data-testid="sub-link-badge"
                    className="rounded-xs rounded-sm bg-brand-500 px-1 text-3xs uppercase text-neutral-50"
                  >
                    {subLink.badge}
                  </span>
                )}
              </Link>
            ))}
          </NavigationLeftSubLink>
        )
      )}
    </div>
  )
}

export default NavigationLeft
