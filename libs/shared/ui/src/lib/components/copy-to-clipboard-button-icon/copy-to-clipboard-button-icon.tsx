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
  tooltipOpen?: boolean
  asButton?: boolean
}

export function CopyToClipboardButtonIcon(props: CopyToClipboardButtonIconProps) {
  const { content, className = '', iconClassName = '', tooltipContent = 'Copy', tooltipOpen, asButton = false } = props

  const [icon, setIcon] = useState<IconName>('copy')
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = () => {
    copyToClipboard(content)
    setIcon('check')
    setTimeout(() => setIcon('copy'), 1000)
  }

  const iconContent = <Icon iconName={icon} className={iconClassName} />
  const controlClassName = twMerge(
    "relative cursor-pointer transition after:absolute after:inset-[-4px] after:block after:content-['']",
    className
  )

  return (
    <Tooltip content={tooltipContent} open={tooltipOpen}>
      {asButton ? (
        <button
          type="button"
          aria-label={tooltipContent}
          onClick={onClickCopyToClipboard}
          className={controlClassName}
          data-testid="copy-container"
        >
          {iconContent}
        </button>
      ) : (
        <span onClick={onClickCopyToClipboard} className={controlClassName} data-testid="copy-container">
          {iconContent}
        </span>
      )}
    </Tooltip>
  )
}

export default CopyToClipboardButtonIcon
