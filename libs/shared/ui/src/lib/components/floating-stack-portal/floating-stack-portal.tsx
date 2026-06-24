import { type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from '@qovery/shared/util-js'

const FLOATING_STACK_ROOT_ID = 'qovery-floating-stack'

function getFloatingStackRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null

  let root = document.getElementById(FLOATING_STACK_ROOT_ID)

  if (!root) {
    root = document.createElement('div')
    root.id = FLOATING_STACK_ROOT_ID
    root.className = 'pointer-events-none fixed bottom-4 left-4 right-4 ml-auto flex max-w-md flex-col items-end gap-2'
    document.body.appendChild(root)
  }

  return root
}

export interface FloatingStackPortalProps {
  children: ReactNode
  position?: 'top' | 'bottom'
  className?: string
}

export function FloatingStackPortal({ children, position = 'bottom', className }: FloatingStackPortalProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setRoot(getFloatingStackRoot())
  }, [])

  if (!root) return null

  return createPortal(
    <div
      className={twMerge(
        'pointer-events-auto flex w-full justify-end',
        position === 'top' ? 'order-first' : 'order-last',
        className
      )}
    >
      {children}
    </div>,
    root
  )
}

export default FloatingStackPortal
