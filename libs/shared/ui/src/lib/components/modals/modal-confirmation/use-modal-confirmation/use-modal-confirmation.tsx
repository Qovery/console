import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import useModal from '../../../modal/use-modal/use-modal'
import { ModalConfirmation } from '../modal-confirmation'

export interface UseModalConfirmationProps {
  title: string
  description?: ReactNode
  action: () => void
  name?: string
  mode?: keyof typeof EnvironmentModeEnum | string | undefined
  warning?: ReactNode
  placeholder?: string
  confirmationMethod?: 'name' | 'action'
  confirmationAction?: string
}

export function useModalConfirmation() {
  const [modalConfirmation, openModalConfirmation] = useState<UseModalConfirmationProps>()
  const { openModal } = useModal()

  useEffect(() => {
    if (
      modalConfirmation?.confirmationMethod === 'action' ||
      modalConfirmation?.mode === EnvironmentModeEnum.PRODUCTION ||
      modalConfirmation?.mode === EnvironmentModeEnum.STAGING
    ) {
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
    } else {
      modalConfirmation?.action()
    }
  }, [modalConfirmation, openModal])

  return { openModalConfirmation }
}

export default useModalConfirmation
