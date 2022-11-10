import { ReactNode, useContext, useEffect, useState } from 'react'
import { ModalContext } from '../modal-root'

export interface UseModalProps {
  content: ReactNode
  options?: {
    width: number
  }
}

export function useModal() {
  const [modal, openModal] = useState<UseModalProps>()
  const { setOpenModal, setContentModal, setOptionsModal, enableAlertClickOutside } = useContext(ModalContext)

  useEffect(() => {
    if (modal) {
      setOpenModal(true)
      if (modal.options) setOptionsModal(modal.options)
      setContentModal(modal.content)
    }
  }, [modal, setContentModal, setOpenModal, setOptionsModal])

  return { openModal, closeModal: () => setOpenModal(false), enableAlertClickOutside }
}

export default useModal
