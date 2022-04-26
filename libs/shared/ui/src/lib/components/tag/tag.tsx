export interface TagProps {
  children: React.ReactNode
  className?: string
}

export function Tag(props: TagProps) {
  const { children, className = '' } = props

  return <div className={`h-6 px-2 rounded text-xs items-center inline-flex font-bold ${className}`}>{children}</div>
}

export default Tag
