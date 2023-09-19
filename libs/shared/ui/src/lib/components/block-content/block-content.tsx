import { type PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export interface BlockContentProps {
  title: string
  customWidth?: string
  className?: string
  classNameContent?: string
  dataTestId?: string
}

export function BlockContent(props: PropsWithChildren<BlockContentProps>) {
  const {
    children,
    className = '',
    title,
    customWidth = 'w-full',
    classNameContent,
    dataTestId = 'block-content',
  } = props

  return (
    <div
      data-testid={dataTestId}
      className={`border border-neutral-250 bg-neutral-100 rounded mb-5 ${className} ${customWidth}`}
    >
      <div className="flex items-center justify-between h-9 px-4 border-b border-neutral-250">
        <h2 className="font-medium text-neutral-400 text-ssm">{title}</h2>
      </div>
      <div className={twMerge('p-5', classNameContent)}>{children}</div>
    </div>
  )
}

export default BlockContent
