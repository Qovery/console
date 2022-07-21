export interface BlockContentProps {
  className?: string
  children: React.ReactNode
  title: string
  customWidth?: string
}

export function BlockContent(props: BlockContentProps) {
  const { children, className = '', title, customWidth = 'w-[580px]' } = props

  return (
    <div
      className={`border border-element-light-lighter-500 bg-element-light-lighter-200 rounded mb-5 ${className} ${customWidth}`}
    >
      <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
        <h2 className="font-medium text-text-600 text-ssm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default BlockContent
