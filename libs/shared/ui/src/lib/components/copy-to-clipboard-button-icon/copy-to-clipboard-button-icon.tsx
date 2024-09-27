import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'

export interface CopyToClipboardButtonIconProps {
  content: string
  className?: string
  iconClassName?: string
  tooltipContent?: string
  defaultIcon?: IconName
}

export function CopyToClipboardButtonIcon(props: CopyToClipboardButtonIconProps) {
  const { content, className = '', iconClassName = '', tooltipContent = 'Copy', defaultIcon = 'copy' } = props

  const [icon, setIcon] = useState(defaultIcon)
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = () => {
    copyToClipboard(content)
    setIcon('check')
    setTimeout(() => setIcon(defaultIcon), 1000)
  }

  return (
    <Tooltip content={tooltipContent} delayDuration={0}>
      <span
        onClick={onClickCopyToClipboard}
        className={twMerge(
          "relative cursor-pointer after:absolute after:inset-[-4px] after:block after:content-['']",
          className
        )}
        data-testid="copy-container"
      >
        <Icon iconName={icon} className={iconClassName} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboardButtonIcon
