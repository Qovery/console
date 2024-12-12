import * as Dialog from '@radix-ui/react-dialog'
import { type ReactElement, type ReactNode, cloneElement, useContext, useEffect, useState } from 'react'
import { Icon } from '../icon/icon'
import useModalAlert from '../modal-alert/use-modal-alert/use-modal-alert'
import { ModalContext } from './modal-root'

export interface ModalProps {
  children: ReactElement
  trigger?: ReactNode
  defaultOpen?: boolean
  buttonClose?: boolean
  width?: number | string
  fullScreen?: boolean
  className?: string
  externalOpen?: boolean
  setExternalOpen?: (e: boolean) => void
  /**
   * This is a workaround to avoid radix dialog restriction.
   * Radix use [react-remove-scroll](https://www.npmjs.com/package/react-remove-scroll) to prevent wheel / scroll event directly on `<html>` node
   * in some cases like with Select inside Modal, it causes issues.
   * https://qovery.atlassian.net/browse/FRT-868
   * https://qovery.atlassian.net/browse/FRT-1134
   *
   * It worth noting that scroll lock is also important for accessibility reasons
   * This `fakeModal` mode is visually identical than the `modal` mode without the drawback of locking the scroll.
   * https://github.com/radix-ui/primitives/blob/b32a93318cdfce383c2eec095710d35ffbd33a1c/packages/react/dialog/src/Dialog.tsx#L204
   */
  fakeModal?: boolean
}

export interface ModalContentProps {
  setOpen?: (open: boolean) => void
}

export const Modal = (props: ModalProps) => {
  const {
    children,
    trigger,
    width = '474',
    fullScreen = false,
    className = '',
    defaultOpen = false,
    buttonClose = true,
    externalOpen = false,
    setExternalOpen,
    fakeModal = false,
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
      onOpenChange={
        setExternalOpen
          ? () => {
              setExternalOpen(!externalOpen)
            }
          : () => {
              setOpen(!open)
            }
      }
      modal={!fakeModal}
    >
      {trigger && <div onClick={() => setOpen(!open)}>{trigger}</div>}
      <Dialog.Portal>
        <Dialog.Overlay
          data-testid="overlay"
          onClick={(event) => {
            if (alertClickOutside) {
              event.preventDefault()
              setModalAlertOpen(true)
            } else {
              setExternalOpen ? setExternalOpen(false) : setOpen(false)
            }
          }}
          className="modal__overlay fixed left-0 top-0 flex h-screen w-full bg-neutral-700/20"
        />
        {fakeModal && (
          <div
            className="modal__overlay fixed left-0 top-0 flex h-screen w-full bg-neutral-700/20"
            onClick={(event) => {
              if (alertClickOutside) {
                event.preventDefault()
                setModalAlertOpen(true)
              } else {
                setExternalOpen ? setExternalOpen(false) : setOpen(false)
              }
            }}
          />
        )}
        <Dialog.Content
          onPointerDownOutside={(event) => {
            event.preventDefault()
          }}
          style={
            fullScreen
              ? { width: 'calc(100vw - 48px)', height: 'calc(100vh  - 48px)', top: 24 }
              : { width: `${width}px` }
          }
          className={`modal__content fixed left-1/2 top-[84px] rounded-md bg-white shadow-[0_0_32px_rgba(0,0,0,0.08)] dark:bg-neutral-550 ${className}`}
        >
          <div className={`overflow-auto ${fullScreen ? '' : 'max-h-[80vh]'}`}>
            {cloneElement(children, {
              setOpen: setExternalOpen ? setExternalOpen : setOpen,
            })}
            {buttonClose && (
              <Dialog.Close className="absolute right-4 top-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-350 duration-300 ease-out hover:bg-neutral-250 hover:text-neutral-400">
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
