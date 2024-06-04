import { type ReactNode } from 'react'
import { ErrorBoundary } from '@qovery/shared/ui'

export interface ContainerProps {
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { children } = props

  return (
    <div className="flex w-full flex-1 flex-col rounded-t bg-white">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}

export default Container
