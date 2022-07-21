import { ReactNode } from 'react'
import { NavigationLeft, NavigationLeftLinkProps } from '@console/shared/ui'

export interface PageSettingsProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function PageSettings(props: PageSettingsProps) {
  const { links, children } = props

  return (
    <div className="bg-white flex mt-2 min-h-[calc(100%-200px)] rounded-sm">
      <div className="w-72 shrink-0 pt-6 border-r border-element-light-lighter-400">
        <NavigationLeft links={links} />
      </div>
      {children}
    </div>
  )
}

export default PageSettings
