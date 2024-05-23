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
      className={twMerge('mb-5 rounded border border-neutral-250 bg-neutral-100', customWidth, className)}
    >
      <div className="flex h-9 items-center justify-between border-b border-neutral-250 px-4">
        <h2 className="text-ssm font-medium text-neutral-400">{title}</h2>
        {headRight}
      </div>
      <div className={twMerge('p-5', classNameContent)}>{children}</div>
    </div>
  )
}

export default BlockContent
