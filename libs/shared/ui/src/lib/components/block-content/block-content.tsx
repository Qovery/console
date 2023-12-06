import { type PropsWithChildren } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface BlockContentProps {
  title: string
  customWidth?: string
  className?: string
  classNameContent?: string
  dataTestId?: string
  headRight?: React.ReactNode
}

export function BlockContent({
  children,
  className = '',
  title,
  customWidth = 'w-full',
  classNameContent,
  dataTestId = 'block-content',
  headRight,
}: PropsWithChildren<BlockContentProps>) {
  return (
    <div
      data-testid={dataTestId}
      className={twMerge('border border-neutral-250 bg-neutral-100 rounded mb-5', customWidth, className)}
    >
      <div className="flex items-center justify-between h-9 px-4 border-b border-neutral-250">
        <h2 className="font-medium text-neutral-400 text-ssm">{title}</h2>
        {headRight}
      </div>
      <div className={twMerge('p-5', classNameContent)}>{children}</div>
    </div>
  )
}

export default BlockContent
