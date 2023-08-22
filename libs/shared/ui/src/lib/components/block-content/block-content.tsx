import { type PropsWithChildren } from 'react'

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
    classNameContent = 'p-5',
    dataTestId = 'block-content',
  } = props

  return (
    <div
      data-testid={dataTestId}
      className={`border border-element-light-lighter-500 bg-zinc-100 rounded mb-5 ${className} ${customWidth}`}
    >
      <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
        <h2 className="font-medium text-zinc-400 text-ssm">{title}</h2>
      </div>
      <div className={classNameContent}>{children}</div>
    </div>
  )
}

export default BlockContent
