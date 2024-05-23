import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'

export interface CopyButtonProps {
  content: string
  className?: string
}

export function CopyButton({ content, className = '' }: CopyButtonProps) {
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
      onClick={() => onClickCopyToClipboard(content)}
      className={twMerge('cursor-pointer gap-2 font-medium', className)}
    >
      Copy
      <Icon iconName={icon} className="text-xs" />
    </Button>
  )
}

export default CopyButton
