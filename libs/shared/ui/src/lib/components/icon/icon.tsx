/* eslint-disable-next-line */

import { IconEnum } from '../../enums/icon.enum'
import Refresh from './icons/refresh'
import Trash from './icons/trash'
import Rollback from './icons/rollback'

export interface IconProps {
  name: IconEnum
  width?: string
  viewBox?: string
  className?: string
}

export function Icon(props: IconProps) {
  const formattedProps = { ...props }

  formattedProps.width = formattedProps.width || '1.25rem'
  formattedProps.viewBox = formattedProps.viewBox || '0 0 24 24'

  switch (props.name) {
    case IconEnum.REFRESH:
      return <Refresh {...formattedProps} />
    case IconEnum.TRASH:
      return <Trash {...formattedProps} />
    case IconEnum.ROLLBACK:
      return <Rollback {...formattedProps} />
    default:
      return <Refresh {...formattedProps} />
  }
}

export default Icon
