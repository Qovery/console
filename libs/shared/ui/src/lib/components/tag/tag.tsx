export enum TagStyle {
  NORMAL = 'normal',
  STROKED = 'stroked',
  FLAT = 'flat',
}

export interface TagProps {
  children: React.ReactNode
  className?: string
  style: TagStyle
}

export function Tag(props: TagProps) {
  const { children, className, style = TagStyle.NORMAL } = props

  return (
    <div className={`tag tag--${style} h-6 px-2 rounded text-xs items-center inline-flex gap-2 ${className}`}>
      {children}
    </div>
  )
}

export default Tag
