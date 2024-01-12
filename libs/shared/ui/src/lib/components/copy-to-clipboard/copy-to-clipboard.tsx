import { Slot } from '@radix-ui/react-slot'
import { Children, type ReactElement, type ReactNode, cloneElement, useState } from 'react'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { Icon } from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export type CopyToClipboardProps = { text: string; children: ReactNode }

export function CopyToClipboard({ text, children }: CopyToClipboardProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  Children.only(children)

  const child = children as ReactElement

  return (
    <Slot
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
            { ...child.props, color: 'green', variant: 'solid' },
            <Icon name={IconAwesomeEnum.CHECK} className="mr-2" />,
            'Copied'
          )
        : child}
    </Slot>
  )
}

export default CopyToClipboard
