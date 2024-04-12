import { type ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { children } = props

  return <div className="bg-white flex flex-col flex-1 rounded-t w-full">{children}</div>
}

export default Container
