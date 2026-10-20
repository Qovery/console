import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import Button, { type ButtonProps } from '../button/button'
import Icon from '../icon/icon'

export interface CopyButtonProps {
  content: string
  size?: ButtonProps['size']
  iconPosition?: 'left' | 'right'
  className?: string
}

export function CopyButton({ content, size, iconPosition = 'right', className }: CopyButtonProps) {
  const [icon, setIcon] = useState<IconName>('copy')
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = (content: string) => {
    copyToClipboard(content)
    setIcon('check')
    setTimeout(() => {
      setIcon('copy')
    }, 1000)
  }

  return (
    <Button
      type="button"
      color="neutral"
      variant="outline"
      size={size}
      onClick={() => onClickCopyToClipboard(content)}
      className={twMerge('cursor-pointer font-sans font-medium', className)}
    >
      {iconPosition === 'left' && <Icon iconName={icon} iconStyle="solid" className="text-sm" />}
      Copy
      {iconPosition === 'right' && <Icon iconName={icon} className="text-xs" />}
    </Button>
  )
}

export default CopyButton
