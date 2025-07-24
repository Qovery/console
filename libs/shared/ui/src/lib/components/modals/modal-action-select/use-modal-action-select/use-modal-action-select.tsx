import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import useModal from '../../../modal/use-modal/use-modal'
import { ModalActionSelect } from '../modal-action-select'

export interface ActionSelectItem {
  id: string // Also used as the text the user has to type to confirm
  title: string
  callback: () => void
  description?: ReactNode
  icon?: IconName
  color?: 'brand' | 'red' | 'yellow' | 'green' | 'neutral'
}

export interface UseModalActionSelectProps {
  title: string
  actions: ActionSelectItem[]
  entities?: ReactNode[]
  description?: ReactNode
  name?: string
  mode?: keyof typeof EnvironmentModeEnum | string | undefined
  warning?: ReactNode
  isDelete?: boolean
}

export function useModalActionSelect() {
  const [modalActionSelect, openModalActionSelect] = useState<UseModalActionSelectProps>()
  const { openModal } = useModal()

  useEffect(() => {
    if (modalActionSelect) {
      openModal({
        content: (
          <ModalActionSelect
            title={modalActionSelect.title}
            actions={modalActionSelect.actions}
            entities={modalActionSelect.entities}
            description={modalActionSelect.description}
            name={modalActionSelect.name}
            warning={modalActionSelect.warning}
          />
        ),
        options: {
          width: 740,
        },
      })
    }
  }, [modalActionSelect, openModal])

  return { openModalActionSelect }
}

export default useModalActionSelect
