import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import { useModal } from '@qovery/shared/ui'
import { DatabaseDeployModal } from '../database-deploy-modal'

export type DatabaseDeployModalData = {
  action: string
  name: string
}

export interface ActionItem {
  id: string // Also used as the text the user has to type to confirm
  title: string
  callback: (data: DatabaseDeployModalData) => void
  description?: ReactNode
  icon?: IconName
  color?: 'brand' | 'red' | 'yellow' | 'green' | 'neutral'
}

export interface UseDatabaseDeployModalProps {
  title: string
  actions: ActionItem[]
  entities?: ReactNode[]
  description?: ReactNode
  name?: string
  submitButtonText?: string
  mode?: keyof typeof EnvironmentModeEnum | string | undefined
  warning?: ReactNode
}

export function useDatabaseDeployModal() {
  const [databaseDeployModal, openDatabaseDeployModal] = useState<UseDatabaseDeployModalProps>()
  const { openModal } = useModal()

  useEffect(() => {
    if (databaseDeployModal) {
      openModal({
        content: (
          <DatabaseDeployModal
            title={databaseDeployModal.title}
            actions={databaseDeployModal.actions}
            entities={databaseDeployModal.entities}
            description={databaseDeployModal.description}
            name={databaseDeployModal.name}
            submitButtonText={databaseDeployModal.submitButtonText}
          />
        ),
        options: {
          width: 740,
        },
      })
    }
  }, [databaseDeployModal, openModal])

  return { openDatabaseDeployModal }
}

export default useDatabaseDeployModal
