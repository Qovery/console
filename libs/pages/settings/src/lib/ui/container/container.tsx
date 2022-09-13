import { ReactNode } from 'react'
import { NavigationLeft, NavigationLeftLinkProps } from '@console/shared/ui'

export interface ContainerProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { links, children } = props

  return (
    <div className="bg-white flex rounded-sm">
      <div className="w-72 border-r border-element-light-lighter-400 relative shrink-0 min-h-[calc(100vh-10px)] pb-10">
        <NavigationLeft className="sticky top-14 pt-6" links={links} />
      </div>
      <div className="flex flex-grow min-h-[calc(100vh-10px)]">{children}</div>
    </div>
  )
}

export default Container
