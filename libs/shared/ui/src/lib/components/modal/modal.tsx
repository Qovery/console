import { ReactNode, useState, cloneElement, ReactElement } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Icon } from '../icon/icon'
export interface ModalProps {
  children: ReactElement
  trigger: ReactNode
  defaultOpen?: boolean
  buttonClose?: boolean
  width?: number
  className?: string
}

export interface ModalContentProps {
  setOpen?: (open: boolean) => void
}

const Modal = (props: ModalProps) => {
  const { children, trigger, width = '474', className = '', defaultOpen = false, buttonClose = true } = props

  const [open, setOpen] = useState(defaultOpen)

  return (
    <Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      <Dialog.Portal>
        <Dialog.Overlay className="modal__overlay flex fixed top-0 left-0 bg-element-light-darker-500/20 w-full h-screen z-30" />
        <Dialog.Content
          style={{ width: `${width}px` }}
          className={`modal__content fixed top-[84px] left-1/2 bg-white rounded-md shadow-[0_0_32px_rgba(0,0,0,0.08)] z-40 ${className}`}
        >
          {cloneElement(children, { setOpen: setOpen })}
          {buttonClose && (
            <Dialog.Close>
              <span className="absolute top-4 right-4 flex w-7 h-7 items-center justify-center bg-element-light-lighter-400 text-text-400 hover:text-brand-500 hover:bg-element-light-lighter-500 ease-out duration-300 rounded-full">
                <Icon name="icon-solid-xmark" />
              </span>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
