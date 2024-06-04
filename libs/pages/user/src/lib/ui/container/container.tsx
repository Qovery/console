import { type ReactNode } from 'react'
import { ErrorBoundary, NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface ContainerProps {
  userLinks: NavigationLeftLinkProps[]
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { userLinks, children } = props

  return (
    <div className="flex rounded-t bg-white">
      <div className="relative min-h-[calc(100vh-10px)] w-72 shrink-0 border-r border-neutral-200 pb-10">
        <div className="sticky top-7">
          <NavigationLeft title="Account" links={userLinks} className="py-6" />
        </div>
      </div>
      <ErrorBoundary>
        <div className="flex min-h-[calc(100vh-10px)] flex-grow">{children}</div>
      </ErrorBoundary>
    </div>
  )
}

export default Container
