import './icon-fa.module.scss'

export interface IconFaProps {
  name: string
}

export function IconFa(props: IconFaProps) {

  const {
    name
  } = props

  return (
    <span className={name}></span>
  )
}

export default IconFa
