export interface BlockContentProps {
  children: React.ReactNode
  title: string
  customWidth?: string
  className?: string
  classNameContent?: string
  dataTestId?: string
}

export function BlockContent(props: BlockContentProps) {
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
      className={`border border-element-light-lighter-500 bg-element-light-lighter-200 rounded mb-5 ${className} ${customWidth}`}
    >
      <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
        <h2 className="font-medium text-text-600 text-ssm">{title}</h2>
      </div>
      <div className={classNameContent}>{children}</div>
    </div>
  )
}

export default BlockContent
