import { useEffect, useRef, useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import Button, { type ButtonProps } from '../button/button'
import Icon from '../icon/icon'

export interface CopyButtonProps {
  content: string
  size?: ButtonProps['size']
  iconPosition?: 'left' | 'right'
  className?: string
  iconOnly?: boolean
  /** What is copied, for screen readers: "Copy MCP server URL". Defaults to "Copy". */
  'aria-label'?: string
}

const COPIED_FOR_MS = 2000

/**
 * Copies `content` and says so: the label turns to "Copied" for 2 seconds, announced to screen readers
 * through a polite live region.
 */
export function CopyButton({
  content,
  size,
  iconPosition = 'right',
  className,
  iconOnly = false,
  'aria-label': ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [, copyToClipboard] = useCopyToClipboard()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onClickCopyToClipboard = () => {
    copyToClipboard(content)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_FOR_MS)
  }

  const icon = copied ? 'check' : 'copy'

  return (
    <Button
      type="button"
      color="neutral"
      variant="outline"
      size={size}
      iconOnly={iconOnly}
      aria-label={ariaLabel ?? (iconOnly ? 'Copy' : undefined)}
      onClick={onClickCopyToClipboard}
      className={twMerge('cursor-pointer font-sans font-medium', className)}
    >
      {iconPosition === 'left' && <Icon iconName={icon} iconStyle="solid" className="text-sm" />}
      <span aria-live="polite" className={iconOnly ? 'sr-only' : undefined}>
        {copied ? 'Copied' : iconOnly ? '' : 'Copy'}
      </span>
      {iconPosition === 'right' && <Icon iconName={icon} className="text-sm" />}
    </Button>
  )
}

export default CopyButton
