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

  return (
    <i className={`${type === IconFaEnum.REGULAR ? 'fa-regular' : 'fa-solid'} ${name}`}></i>
  )
}

export default IconFa
