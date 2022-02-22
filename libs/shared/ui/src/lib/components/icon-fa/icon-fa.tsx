import './icon-fa.module.scss'
import { IconFaEnum } from '../../enums/icon-fa.enum'

export interface IconFaProps {
  type: IconFaEnum,
  name: string
}

export function IconFa(props: IconFaProps) {

  const {
    type = IconFaEnum.SOLID,
    name
  } = props

  return (
    <i className={`${type === IconFaEnum.SOLID ? 'fa-solid' : 'fa-brands'} fa-${name}`}></i>
  )
}

export default IconFa
