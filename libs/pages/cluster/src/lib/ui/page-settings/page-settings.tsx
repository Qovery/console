import { type ReactNode } from 'react'
import { ErrorBoundary, NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'

export interface PageSettingsProps {
  links: NavigationLeftLinkProps[]
  children: ReactNode
}

export function PageSettings(props: PageSettingsProps) {
  const { links, children } = props

  return (
    <div className="flex flex-grow">
      <div className="relative w-72 shrink-0 border-r border-neutral-200 pb-10">
        <NavigationLeft className="sticky top-14 pt-5" links={links} />
      </div>
      <div className="flex flex-grow">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  )
}

export default PageSettings
