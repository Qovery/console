import { useState } from 'react'
import { ButtonLegacy, ButtonSize, ButtonStyle, IconAwesomeEnum, IconFa } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'

export interface CopyButtonProps {
  content: string
  className?: string
}

export function CopyButton({ content, className = '' }: CopyButtonProps) {
  const [icon, setIcon] = useState(IconAwesomeEnum.COPY)
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = (content: string) => {
    copyToClipboard(content)
    setIcon(IconAwesomeEnum.CHECK)
    setTimeout(() => {
      setIcon(IconAwesomeEnum.COPY)
    }, 1000)
  }

  return (
    <ButtonLegacy
      onClick={() => onClickCopyToClipboard(content)}
      style={ButtonStyle.DARK}
      size={ButtonSize.TINY}
      className={`cursor-pointer font-medium ${className}`}
    >
      Copy
      <IconFa name={icon} className="ml-2 text-xs" />
    </ButtonLegacy>
  )
}

export default CopyButton
