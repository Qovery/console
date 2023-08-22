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
      <div className="w-72 border-r border-zinc-200 relative min-h-height-with-navigation-left pb-10">
        <NavigationLeft className="sticky top-14 pt-6" links={links} />
      </div>
      <div className="flex flex-grow min-h-height-with-navigation-left">{children}</div>
    </div>
  )
}

export default PageSettings
