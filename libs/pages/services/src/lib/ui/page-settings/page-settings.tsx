import { type ReactNode } from 'react'
import { NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface PageSettingsProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function PageSettings(props: PageSettingsProps) {
  const { links, children } = props

  return (
    <div className="flex flex-grow rounded-sm bg-white">
      <div className="border-r border-neutral-200 pb-10">
        <div className="relative w-72">
          <NavigationLeft className="sticky top-14 pt-6" links={links} />
        </div>
      </div>
      <div className="flex flex-grow">{children}</div>
    </div>
  )
}

export default PageSettings
