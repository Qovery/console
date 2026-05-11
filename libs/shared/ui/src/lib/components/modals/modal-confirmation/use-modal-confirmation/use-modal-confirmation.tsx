import { type ReactNode, useCallback } from 'react'
import useModal from '../../../modal/use-modal/use-modal'
import { ModalConfirmation } from '../modal-confirmation'

export interface UseModalConfirmationProps {
  title: string
  description?: ReactNode
  action: () => Promise<void> | void
  name?: string
  warning?: ReactNode
  placeholder?: string
  confirmationMethod?: 'name' | 'action'
  confirmationAction?: string
}

export function useModalConfirmation() {
  const { openModal } = useModal()

  const openModalConfirmation = useCallback(
    (modalConfirmation: UseModalConfirmationProps) => {
      openModal({
        content: (
          <ModalConfirmation
            title={modalConfirmation.title}
            description={modalConfirmation.description}
            name={modalConfirmation.name}
            warning={modalConfirmation.warning}
            callback={modalConfirmation.action}
            placeholder={modalConfirmation.placeholder}
            confirmationMethod={modalConfirmation?.confirmationMethod}
            confirmationAction={modalConfirmation?.confirmationAction}
          />
        ),
      })
    },
    [openModal]
  )

  return { openModalConfirmation }
}

export default useModalConfirmation
