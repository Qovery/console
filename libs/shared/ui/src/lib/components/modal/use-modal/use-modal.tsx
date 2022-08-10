import { ReactNode, useContext, useEffect, useState } from 'react'
import { ModalContext, defaultModalOptions } from '../modal-root'

export interface UseModalProps {
  content: ReactNode
  options?: {
    width: number
  }
}

export function useModal() {
  const [modal, openModal] = useState<UseModalProps>()
  const { setOpenModal, setContentModal, setOptionsModal } = useContext(ModalContext)

  useEffect(() => {
    if (modal) {
      setOpenModal(true)
      setOptionsModal({ ...defaultModalOptions, ...modal.options })

      setContentModal(modal.content)
    }
  }, [modal, setContentModal, setOpenModal, setOptionsModal])

  return { openModal, closeModal: () => setOpenModal(false) }
}

export default useModal
