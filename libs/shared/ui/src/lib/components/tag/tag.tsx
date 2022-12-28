export enum TagSize {
  NORMAL = 'normal',
  BIG = 'big',
}

export interface TagProps {
  children: React.ReactNode
  className?: string
  size?: TagSize
  dataTestId?: string
}

export function Tag(props: TagProps) {
  const { children, className = '', size = TagSize.NORMAL, dataTestId = 'tag' } = props

  const normalClassName = size === TagSize.NORMAL ? 'h-7 px-2' : ''
  const bigClassName = size === TagSize.BIG ? 'h-8 px-3' : ''

  return (
    <span
      data-testid={dataTestId}
      className={`rounded text-xs items-center inline-flex font-bold ${normalClassName} ${bigClassName} ${className}`}
    >
      {children}
    </span>
  )
}

export default Tag
