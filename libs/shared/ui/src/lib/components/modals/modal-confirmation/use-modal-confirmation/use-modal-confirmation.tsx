import { useContext, useEffect, useState } from 'react'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { ModalContext } from '../../../modal/modal-root'
import { ModalConfirmation } from '../modal-confirmation'

export interface UseModalConfirmationProps {
  title: string
  description: string
  action: () => void
  name?: string
  mode?: EnvironmentModeEnum | string | undefined
}

export function useModalConfirmation() {
  const [modalConfirmation, setModalConfirmation] = useState<UseModalConfirmationProps>()
  const { setOpenModal, setContentModal } = useContext(ModalContext)

  useEffect(() => {
    if (
      modalConfirmation?.mode === EnvironmentModeEnum.PRODUCTION ||
      modalConfirmation?.mode === EnvironmentModeEnum.STAGING
    ) {
      setOpenModal(true)
      setContentModal(
        <ModalConfirmation
          title={modalConfirmation.title}
          description={modalConfirmation.description}
          name={modalConfirmation.name}
          callback={modalConfirmation.action}
        />
      )
    } else {
      modalConfirmation?.action()
    }
  }, [modalConfirmation, setContentModal, setOpenModal])

  return { setModalConfirmation }
}

export default useModalConfirmation
