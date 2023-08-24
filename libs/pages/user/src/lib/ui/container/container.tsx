import { type ReactNode } from 'react'
import { NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface ContainerProps {
  userLinks: NavigationLeftLinkProps[]
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { userLinks, children } = props

  return (
    <div className="bg-white flex rounded-t">
      <div className="w-72 border-r border-neutral-200 relative shrink-0 min-h-[calc(100vh-10px)] pb-10">
        <div className="sticky top-7">
          <NavigationLeft title="Account" links={userLinks} className="py-6" />
        </div>
      </div>
      <div className="flex flex-grow min-h-[calc(100vh-10px)]">{children}</div>
    </div>
  )
}

export default Container
