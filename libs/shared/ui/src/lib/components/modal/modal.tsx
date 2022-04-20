import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'

export interface ModalProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
  open?: boolean
  onOpen?: (e: boolean) => void
  width?: number
}

const bodyStyle = (open: boolean) => {
  const body = document.body
  if (open) {
    body.style.cssText = 'margin-right: 0!important; padding-right: 0!important'
  }
}

export function Modal(props: ModalProps) {
  const { trigger, children, className = '', defaultOpen = false, open = false, onOpen, width = 474 } = props

  const [isOpen, setIsOpen] = useState(open)

  const openModal = (open: boolean) => {
    const body = document.body
    if (open) {
      body.style.cssText = 'margin-right: 0!important; padding-right: 0!important'
    }

    onOpen && onOpen(true)
  }

  const stateModal = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Dialog.Root defaultOpen={defaultOpen} onOpenChange={openModal} open={isOpen}>
      <Dialog.Trigger onClick={stateModal}>{trigger}</Dialog.Trigger>
      <Dialog.Portal className="modal">
        <Dialog.Overlay
          onClick={stateModal}
          className="modal__overlay flex fixed top-0 left-0 bg-element-light-darker-500/20 items-start justify-center w-full h-screen z-50"
        >
          <Dialog.Content
            style={{ width: `${width}px` }}
            className={`${className} modal__content bg-white rounded-md shadow-[0_0_32px_rgba(0,0,0,0.08)] mt-20`}
          >
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
