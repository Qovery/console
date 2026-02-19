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
}

export function CopyToClipboardButtonIcon(props: CopyToClipboardButtonIconProps) {
  const { content, className = '', iconClassName = '', tooltipContent = 'Copy' } = props

  const [icon, setIcon] = useState<'copy' | 'check'>('copy')
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = () => {
    copyToClipboard(content)
    setIcon('check')
    setTimeout(() => setIcon('copy'), 1000)
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
        <Icon iconName={icon} iconStyle="solid" className={iconClassName} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboardButtonIcon
