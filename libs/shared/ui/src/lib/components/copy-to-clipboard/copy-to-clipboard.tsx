import { Slot } from '@radix-ui/react-slot'
import { Children, type PropsWithChildren, type ReactElement, cloneElement, useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

export interface CopyToClipboardProps extends PropsWithChildren {
  text: string
  className?: string
}

export function CopyToClipboard({ text, children, className = '' }: CopyToClipboardProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  Children.only(children)

  const child = children as ReactElement

  return (
    <Slot
      className={className}
      onClick={(event) => {
        if (!event.defaultPrevented) {
          copyToClipboard(text)
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
          }, 1000)
        }
      }}
    >
      {copied
        ? cloneElement(
            child,
            {
              ...child.props,
              color: 'green',
              variant: 'solid',
              className: twMerge(child.props.className, 'hover:bg-green-500'),
            },
            <Icon iconName="check" className="mr-1" />,
            'Copied'
          )
        : child}
    </Slot>
  )
}

export default CopyToClipboard
