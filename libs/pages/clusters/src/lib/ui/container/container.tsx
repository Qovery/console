import { ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { children } = props

  return <div className="bg-white flex rounded-t w-full min-h-[calc(100vh-10px)]">{children}</div>
}

export default Container
