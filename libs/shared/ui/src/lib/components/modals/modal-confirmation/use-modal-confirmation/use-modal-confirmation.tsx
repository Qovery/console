import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import useModal from '../../../modal/use-modal/use-modal'
import { ModalConfirmation } from '../modal-confirmation'

export interface UseModalConfirmationProps {
  title: string
  description: string
  action: () => void
  name?: string
  mode?: EnvironmentModeEnum | string | undefined
  warning?: string
  isDelete?: boolean
}

export function useModalConfirmation() {
  const [modalConfirmation, openModalConfirmation] = useState<UseModalConfirmationProps>()
  const { openModal } = useModal()

  useEffect(() => {
    if (
      modalConfirmation?.isDelete ||
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
