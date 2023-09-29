// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import AnsiPrimitive from 'ansi-to-react'
import { type ComponentProps } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface AnsiProps extends ComponentProps<typeof AnsiPrimitive> {}

export function Ansi({ className, children, ...props }: AnsiProps) {
  return (
    <AnsiPrimitive className={twMerge('code-ansi', className)} linkify {...props}>
      {children}
    </AnsiPrimitive>
  )
}
