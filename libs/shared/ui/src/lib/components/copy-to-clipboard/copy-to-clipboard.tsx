import { useState } from 'react'
import { copyToClipboard as copyToClipboardUtil } from '@qovery/shared/utils'
import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'

export interface CopyToClipboardProps {
  content: string
  className?: string
  iconClassName?: string
  tooltipContent?: string
}

export function CopyToClipboard(props: CopyToClipboardProps) {
  const { content, className = '', iconClassName = '', tooltipContent = 'Copy' } = props

  const [icon, setIcon] = useState('icon-solid-copy')

  const copyToClipboard = () => {
    copyToClipboardUtil(content)
    setIcon('icon-solid-check')
    setTimeout(() => {
      setIcon('icon-solid-copy')
    }, 1000)
  }

  return (
    <Tooltip content={tooltipContent}>
      <span
        onClick={copyToClipboard}
        className={`bigger-click-zone cursor-pointer ${className}`}
        data-testid="copy-container"
      >
        <Icon name={icon} className={`${iconClassName}`} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboard
