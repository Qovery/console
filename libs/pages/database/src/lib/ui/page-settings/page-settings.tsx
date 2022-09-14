import { ReactNode } from 'react'
import { NavigationLeft, NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface PageSettingsProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function PageSettings(props: PageSettingsProps) {
  const { links, children } = props

  return (
    <div className="bg-white flex mt-2 rounded-sm">
      <div className="w-72 border-r border-element-light-lighter-400 relative shrink-0 min-h-[calc(100vh-270px)] pb-10">
        <NavigationLeft className="sticky top-14 pt-6" links={links} />
      </div>
      <div className="flex flex-grow min-h-[calc(100vh-270px)]">{children}</div>
    </div>
  )
}

export default PageSettings
