import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement, ReactNode, cloneElement, useContext, useEffect, useState } from 'react'
import { Icon } from '../icon/icon'
import useModalAlert from '../modal-alert/use-modal-alert/use-modal-alert'
import { ModalContext } from './modal-root'

export interface ModalProps {
  children: ReactElement
  trigger?: ReactNode
  defaultOpen?: boolean
  buttonClose?: boolean
  width?: number
  className?: string
  externalOpen?: boolean
  setExternalOpen?: (e: boolean) => void
}

export interface ModalContentProps {
  setOpen?: (open: boolean) => void
}

export const Modal = (props: ModalProps) => {
  const {
    children,
    trigger,
    width = '474',
    className = '',
    defaultOpen = false,
    buttonClose = true,
    externalOpen = false,
    setExternalOpen,
  } = props

  const [open, setOpen] = useState(defaultOpen)
  const { setModalAlertOpen } = useModalAlert()

  const { setAlertModalChoice, enableAlertClickOutside, alertClickOutside, alertModalChoice } = useContext(ModalContext)

  useEffect(() => {
    if (!open)
      // when the modal just open nothing should be dirty in the modal
      enableAlertClickOutside && enableAlertClickOutside(false)
  }, [open, enableAlertClickOutside])

  useEffect(() => {
    if (alertModalChoice) {
      setOpen(false)
      setAlertModalChoice && setAlertModalChoice(undefined)
    }
  }, [alertModalChoice, setOpen, setAlertModalChoice])

  useEffect(() => {
    if (alertClickOutside && setAlertModalChoice && alertModalChoice) {
      setExternalOpen ? setExternalOpen(false) : setOpen(false)
      setModalAlertOpen(false)
      setAlertModalChoice(undefined)
      enableAlertClickOutside && enableAlertClickOutside(false)
    }
  }, [
    setModalAlertOpen,
    enableAlertClickOutside,
    setExternalOpen,
    alertModalChoice,
    alertClickOutside,
    setAlertModalChoice,
  ])

  return (
    <Dialog.Root
      open={externalOpen ? externalOpen : open}
      onOpenChange={setExternalOpen ? () => setExternalOpen(!externalOpen) : () => setOpen(!open)}
    >
      {trigger && <div onClick={() => setOpen(!open)}>{trigger}</div>}
      <Dialog.Portal>
        <Dialog.Overlay
          data-testid={'overlay'}
          onClick={(event) => {
            if (alertClickOutside) {
              event.preventDefault()
              setModalAlertOpen(true)
            } else {
              setExternalOpen ? setExternalOpen(false) : setOpen(false)
            }
          }}
          className="modal__overlay flex fixed top-0 left-0 bg-element-light-darker-500/20 w-full h-screen z-30"
        />
        <Dialog.Content
          onPointerDownOutside={(event) => {
            event.preventDefault()
          }}
          style={{ width: `${width}px` }}
          className={`modal__content fixed top-[84px] left-1/2 bg-white rounded-md shadow-[0_0_32px_rgba(0,0,0,0.08)] z-40 ${className}`}
        >
          <div className="max-h-[80vh] overflow-auto">
            {cloneElement(children, {
              setOpen: setExternalOpen ? setExternalOpen : setOpen,
            })}
            {buttonClose && (
              <Dialog.Close className="absolute top-4 right-4">
                <span className="flex w-7 h-7 items-center justify-center bg-element-light-lighter-400 text-text-400 hover:text-text-500 hover:bg-element-light-lighter-500 ease-out duration-300 rounded-full">
                  <Icon name="icon-solid-xmark" />
                </span>
              </Dialog.Close>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
