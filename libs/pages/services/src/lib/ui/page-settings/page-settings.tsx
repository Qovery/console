import { type ReactNode } from 'react'
import { NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface PageSettingsProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function PageSettings(props: PageSettingsProps) {
  const { links, children } = props

  return (
    <div className="mt-2 flex flex-grow rounded-sm bg-white">
      <div className="relative w-72 border-r border-neutral-200 pb-10">
        <NavigationLeft className="sticky top-14 pt-6" links={links} />
      </div>
      <div className="flex flex-grow">{children}</div>
    </div>
  )
}

export default PageSettings
