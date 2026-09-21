import { type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { ModalContext, type ModalOptions, defaultContext } from '../modal-root'

export interface UseModalProps {
  content: ReactNode
  options?: ModalOptions
}

export function useModal() {
  const [modal, openModal] = useState<UseModalProps>()
  const { setOpenModal, setContentModal, setOptionsModal, enableAlertClickOutside } = useContext(ModalContext)
  const closeModal = useCallback(() => {
    setOpenModal(false)
  }, [setOpenModal])

  useEffect(() => {
    if (modal) {
      if (modal.options?.fakeModal) {
        // XXX: prevent conflict between dropdown menu click event and modal opening.
        // We suppose that dropdownmenu and dialog share the same internal radix state,
        // this result in conflict when trigger a modal opening action from a dropdown menu item.
        // Modal is closed directly after item click probably because radix consider
        // goblal dialog state already opened (due to dropdown menu still present)
        setTimeout(() => {
          setOpenModal(true)
        }, 0)
      } else {
        setOpenModal(true)
      }
      if (modal.options) {
        setOptionsModal({
          ...defaultContext.optionsModal,
          ...modal.options,
        })
      } else {
        // Reset options with default values
        setOptionsModal(defaultContext.optionsModal)
      }
      setContentModal(<>{modal.content}</>)
    }
  }, [modal, setContentModal, setOpenModal, setOptionsModal])

  return { openModal, closeModal, enableAlertClickOutside }
}

export default useModal
