import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import useModal from '../../../modal/use-modal/use-modal'
import { ModalConfirmation } from '../modal-confirmation'

export interface UseModalConfirmationProps {
  title: string
  description?: ReactNode
  action: (isDryRun?: boolean) => void
  name?: string
  mode?: keyof typeof EnvironmentModeEnum | string | undefined
  warning?: ReactNode
  isDelete?: boolean
  isDryRunEnabled?: boolean
  placeholder?: string
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
            callback={(isDryRun) => modalConfirmation.action(isDryRun)}
            placeholder={modalConfirmation.placeholder}
            isDelete={modalConfirmation?.isDelete}
            isDryRunEnabled={modalConfirmation?.isDryRunEnabled}
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
