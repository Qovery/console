import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'

export interface CopyButtonProps {
  content: string
}

export function CopyButton({ content }: CopyButtonProps) {
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
      variant="surface"
      onClick={() => onClickCopyToClipboard(content)}
      className="cursor-pointer gap-2 font-sans font-medium"
    >
      Copy
      <Icon iconName={icon} className="text-xs" />
    </Button>
  )
}

export default CopyButton
