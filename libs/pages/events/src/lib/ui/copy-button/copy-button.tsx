import { useState } from 'react'
import { IconAwesomeEnum, IconFa } from '@qovery/shared/ui'
import { copyToClipboard } from '@qovery/shared/utils'

export interface CopyButtonProps {
  content: string
  className?: string
}

export function CopyButton(props: CopyButtonProps) {
  const { content, className = '' } = props

  const [icon, setIcon] = useState(IconAwesomeEnum.COPY)

  const onClickCopyToClipboard = (content: string) => {
    copyToClipboard(content)
    setIcon(IconAwesomeEnum.CHECK)
    setTimeout(() => {
      setIcon(IconAwesomeEnum.COPY)
    }, 1000)
  }

  return (
    <div
      onClick={() => onClickCopyToClipboard(content)}
      className={`cursor-pointer bg-element-light-darker-100 border border-element-light-lighter-800 text-text-200 hover:text-text-100 transition-all ease-in-out duration-150 font-medium text-xs rounded w-[63px] px-2 py-1 ${className}`}
    >
      Copy
      <IconFa name={icon} className="ml-2 text-xs" />
    </div>
  )
}

export default CopyButton
