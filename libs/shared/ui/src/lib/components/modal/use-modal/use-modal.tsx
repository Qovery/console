import { type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { ModalContext, defaultContext } from '../modal-root'

export interface UseModalProps {
  content: ReactNode
  options?: {
    width?: number
    fullScreen?: boolean
  }
}

export function useModal() {
  const [modal, openModal] = useState<UseModalProps>()
  const { setOpenModal, setContentModal, setOptionsModal, enableAlertClickOutside } = useContext(ModalContext)
  const closeModal = useCallback(() => {
    setOpenModal(false)
  }, [setOpenModal])

  useEffect(() => {
    if (modal) {
      setOpenModal(true)
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
