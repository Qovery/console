export interface IconFaProps {
  name: string
  className?: string
}

export function IconFa(props: IconFaProps) {
  const { name, className = '' } = props

  return <span role="img" className={`${name} ${className}`}></span>
}

export default IconFa
