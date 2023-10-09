import { type ReactNode } from 'react'
import { NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface PageSettingsProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function PageSettings(props: PageSettingsProps) {
  const { links, children } = props

  return (
    <div className="bg-white flex flex-grow mt-2 rounded-sm">
      <div className="w-72 border-r border-neutral-200 relative pb-10">
        <NavigationLeft className="sticky top-14 pt-6" links={links} />
      </div>
      <div className="flex flex-grow">{children}</div>
    </div>
  )
}

export default PageSettings
