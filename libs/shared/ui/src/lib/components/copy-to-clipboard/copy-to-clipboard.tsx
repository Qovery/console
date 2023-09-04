import { useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import Tooltip from '../tooltip/tooltip'

export interface CopyToClipboardProps {
  content: string
  className?: string
  iconClassName?: string
  tooltipContent?: string
}

export function CopyToClipboard(props: CopyToClipboardProps) {
  const { content, className = '', iconClassName = '', tooltipContent = 'Copy' } = props

  const [icon, setIcon] = useState(IconAwesomeEnum.COPY)
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = () => {
    copyToClipboard(content)
    setIcon(IconAwesomeEnum.CHECK)
    setTimeout(() => {
      setIcon(IconAwesomeEnum.COPY)
    }, 1000)
  }

  return (
    <Tooltip content={tooltipContent}>
      <span
        onClick={onClickCopyToClipboard}
        className={`bigger-click-zone cursor-pointer ${className}`}
        data-testid="copy-container"
      >
        <Icon name={icon} className={`${iconClassName}`} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboard
