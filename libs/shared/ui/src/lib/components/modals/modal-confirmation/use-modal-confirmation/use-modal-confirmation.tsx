import { useEffect, useState } from 'react'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { ModalConfirmation } from '../modal-confirmation'
import useModal from '../../../modal/use-modal/use-modal'

export interface UseModalConfirmationProps {
  title: string
  description: string
  action: () => void
  name?: string
  mode?: EnvironmentModeEnum | string | undefined
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
