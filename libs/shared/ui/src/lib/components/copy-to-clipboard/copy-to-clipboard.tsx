import { Icon, Tooltip } from '@console/shared/ui'
import { useState } from 'react'

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
    navigator.clipboard.writeText(content)
    setIcon('icon-solid-check')
    setTimeout(() => {
      setIcon('icon-solid-copy')
    }, 1000)
  }

  return (
    <Tooltip content={tooltipContent}>
      <span onClick={copyToClipboard} className={`cursor-pointer ${className}`} data-testid="copy-container">
        <Icon name={icon} className={`${iconClassName}`} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboard
