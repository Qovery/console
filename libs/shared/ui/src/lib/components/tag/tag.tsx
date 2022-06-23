export enum TagSize {
  NORMAL = 'normal',
  BIG = 'big',
}

export interface TagProps {
  children: React.ReactNode
  className?: string
  size?: TagSize
}

export function Tag(props: TagProps) {
  const { children, className = '', size = TagSize.NORMAL } = props

  return (
    <span
      className={`rounded text-xs items-center inline-flex font-bold ${
        size === TagSize.NORMAL ? 'h-6 px-2' : 'h-8 px-3'
      } ${className}`}
      data-testid="tag"
    >
      {children}
    </span>
  )
}

export default Tag
