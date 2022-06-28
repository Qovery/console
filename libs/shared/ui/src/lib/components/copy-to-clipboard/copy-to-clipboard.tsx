import { Icon, Tooltip } from '@console/shared/ui'
import { useState } from 'react'

export enum CopyToClipboardLayout {
  NORMAL = 'NORMAL',
  DARK = 'DARK',
}

export interface CopyToClipboardProps {
  content: string
  layout?: CopyToClipboardLayout
  className?: string
  iconClassName?: string
  tooltipContent?: string
}

export function CopyToClipboard(props: CopyToClipboardProps) {
  const {
    content,
    layout = CopyToClipboardLayout.NORMAL,
    className = '',
    iconClassName = '',
    tooltipContent = 'Copy',
  } = props

  const [icon, setIcon] = useState('icon-solid-copy')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setIcon('icon-solid-check')
    setTimeout(() => {
      setIcon('icon-solid-copy')
    }, 1000)
  }

  const btnLayout = {
    NORMAL: 'text-text-400',
    DARK: 'text-white',
  }

  return (
    <Tooltip content={tooltipContent}>
      <span onClick={copyToClipboard} className={`cursor-pointer ${className}`} data-testid="copy-container">
        <Icon name={icon} className={`${btnLayout[layout]} ${iconClassName}`} />
      </span>
    </Tooltip>
  )
}

export default CopyToClipboard
