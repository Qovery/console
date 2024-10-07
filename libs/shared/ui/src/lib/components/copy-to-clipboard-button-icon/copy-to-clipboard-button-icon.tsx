import { useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import Tooltip from '../tooltip/tooltip'

export interface CopyToClipboardButtonIconProps {
  content: string
  className?: string
  iconClassName?: string
  tooltipContent?: string
}

export function CopyToClipboardButtonIcon(props: CopyToClipboardButtonIconProps) {
  const { content, className = '', iconClassName = '', tooltipContent = 'Copy' } = props

  const [icon, setIcon] = useState(IconAwesomeEnum.COPY)
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = () => {
    copyToClipboard(content)
    setIcon(IconAwesomeEnum.CHECK)
    setTimeout(() => setIcon(IconAwesomeEnum.COPY), 1000)
  }

  return (
    <Tooltip content={tooltipContent}>
      <span
        onClick={onClickCopyToClipboard}
        className={twMerge(
          "relative cursor-pointer transition after:absolute after:inset-[-4px] after:block after:content-['']",
          className
        )}
        data-testid="copy-container"
      >
        <Icon name={icon} className={iconClassName} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboardButtonIcon
