import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import { useModal } from '@qovery/shared/ui'
import { ServiceRemoveModal } from '../service-remove-modal'

export type ServiceRemoveModalData = {
  action: string
  name: string
  skipDestroy: boolean
}

export interface ActionItem {
  id: string // Also used as the text the user has to type to confirm
  title: string
  callback: (data: ServiceRemoveModalData) => void
  description?: ReactNode
  icon?: IconName
  color?: 'brand' | 'red' | 'yellow' | 'green' | 'neutral'
}

export interface UseServiceRemoveModalProps {
  title: string
  actions: ActionItem[]
  entities?: ReactNode[]
  description?: ReactNode
  name?: string
  mode?: keyof typeof EnvironmentModeEnum | string | undefined
  warning?: ReactNode
  isDelete?: boolean
  hasSkipDestroy?: boolean
}

export function useServiceRemoveModal() {
  const [serviceRemoveModal, openServiceRemoveModal] = useState<UseServiceRemoveModalProps>()
  const { openModal } = useModal()

  useEffect(() => {
    if (serviceRemoveModal) {
      openModal({
        content: <ServiceRemoveModal {...serviceRemoveModal} />,
        options: {
          width: 740,
        },
      })
    }
  }, [serviceRemoveModal, openModal])

  return { openServiceRemoveModal }
}

export default useServiceRemoveModal
