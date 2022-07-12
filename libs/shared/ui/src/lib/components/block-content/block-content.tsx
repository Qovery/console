export interface ContentBlockProps {
  className?: string
  children: React.ReactNode
  title: string
}

export function BlockContent(props: ContentBlockProps) {
  const { children, className = '', title } = props

  return (
    <div className={`border border-element-light-lighter-500 bg-element-light-lighter-200 rounded mb-5 ${className}`}>
      <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
        <h2 className="font-medium text-text-600 text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default BlockContent
