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

  const normalClassName = size === TagSize.NORMAL ? 'h-6 px-2' : ''
  const bigClassName = size === TagSize.BIG ? 'h-8 px-3' : ''

  return (
    <span
      className={`rounded text-xs items-center inline-flex font-bold ${normalClassName} ${bigClassName} ${className}`}
      data-testid="tag"
    >
      {children}
    </span>
  )
}

export default Tag
