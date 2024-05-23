import { type ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { children } = props

  return <div className="flex w-full flex-1 flex-col rounded-t bg-white">{children}</div>
}

export default Container
