import './icon-fa.module.scss'
import { IconFaEnum } from '../../enums/icon-fa.enum'

export interface IconFaProps {
  type: IconFaEnum,
  name: string
}

export function IconFa(props: IconFaProps) {

  const {
    type = IconFaEnum.REGULAR,
    name
  } = props

  const className = `${type === IconFaEnum.REGULAR ? 'fa-brands' : 'fa-solid'} fa-${name}`

  return (
    <span className={`${className}`}></span>
  )
}

export default IconFa
