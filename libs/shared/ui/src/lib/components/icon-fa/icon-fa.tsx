export interface IconFaProps {
  name?: string
  className?: string
}

/**
 * @deprecated Use <Icon iconStyle iconName /> instead
 * cf adr/fontawesome-icons.md
 */
export function IconFa(props: IconFaProps) {
  const { name, className = '' } = props

  return <span role="img" className={`${name} ${className}`}></span>
}

export default IconFa
