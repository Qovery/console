import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import useModal from '../../../modal/use-modal/use-modal'
import { ModalMultiConfirmation } from '../modal-multi-confirmation'

export interface UseModalMultiConfirmationProps {
  title: string
  checks: string[]
  action: () => void
  description?: ReactNode
  mode?: keyof typeof EnvironmentModeEnum | string | undefined
  warning?: ReactNode
  isDelete?: boolean
}

export function useModalMultiConfirmation() {
  const [modalConfirmation, openModalMultiConfirmation] = useState<UseModalMultiConfirmationProps>()
  const { openModal } = useModal()

  useEffect(() => {
    if (
      modalConfirmation?.isDelete ||
      modalConfirmation?.mode === EnvironmentModeEnum.PRODUCTION ||
      modalConfirmation?.mode === EnvironmentModeEnum.STAGING
    ) {
      openModal({
        content: (
          <ModalMultiConfirmation
            title={modalConfirmation.title}
            description={modalConfirmation.description}
            warning={modalConfirmation.warning}
            checks={modalConfirmation.checks}
            callback={modalConfirmation.action}
            isDelete={modalConfirmation?.isDelete}
          />
        ),
      })
    } else {
      modalConfirmation?.action()
    }
  }, [modalConfirmation, openModal])

  return { openModalMultiConfirmation }
}

export default useModalMultiConfirmation
