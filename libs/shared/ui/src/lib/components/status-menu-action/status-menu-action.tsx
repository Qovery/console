import { Icon, Modal, ModalConfirmation } from '@console/shared/ui'
import {
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRestartAvailable,
  isRollbackAvailable,
  isStopAvailable,
  isUpdateAvailable,
  ModalContext,
} from '@console/shared/utils'
import { ClickEvent } from '@szhsin/react-menu'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { useState, useEffect, useContext } from 'react'
import Menu, { MenuAlign, MenuDirection } from '../menu/menu'

export interface StatusMenuActionProps {
  trigger: React.ReactElement
  status: GlobalDeploymentStatus
  name?: string
  width?: number
  direction?: MenuDirection
  arrowAlign?: MenuAlign
  className?: string
  paddingMenuY?: number
  paddingMenuX?: number
  setOpen?: (isOpen: boolean) => void
}

export type StatusMenuActionItem = {
  name: string
  onClick: (e: ClickEvent) => void
  contentLeft: React.ReactNode
}

export function StatusMenuAction(props: StatusMenuActionProps) {
  const {
    status,
    name,
    trigger,
    width = 340,
    paddingMenuX = 12,
    paddingMenuY = 12,
    className = '',
    direction = MenuDirection.BOTTOM,
    arrowAlign = MenuAlign.START,
    setOpen,
  } = props
  const [topMenu, setTopMenu] = useState<StatusMenuActionItem[]>([])
  const [bottomMenu, setBottomMenu] = useState<StatusMenuActionItem[]>([])

  const { setOpenModal, setContentModal } = useContext(ModalContext)

  const deployButton = {
    name: 'Deploy',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
  }

  const stopButton = {
    name: 'Stop',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
  }

  const redeployButton = {
    name: 'Redeploy',
    onClick: (e: ClickEvent) => {
      e.syntheticEvent.preventDefault()
      setOpenModal(true)
      setContentModal(
        <ModalConfirmation
          title="Confirm redeploy"
          description="To confirm the redeploy of your environment, please type the name of the environment:"
          name={name || ''}
          callback={() => {
            console.log('callback')
          }}
        />
      )
    },
    contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
  }

  const updateButton = {
    name: 'Update applications',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
  }

  const rollbackButton = {
    name: 'Rollback',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
  }

  const cancelBuildButton = {
    name: 'Cancel Build',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-xmark" className="text-sm text-brand-400" />,
  }

  const removeButton = {
    name: 'Remove',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
  }

  useEffect(() => {
    if (isDeployAvailable(status)) {
      setTopMenu((topMenu) => [...topMenu, deployButton])
    }
    if (isRestartAvailable(status)) {
      setTopMenu((topMenu) => [...topMenu, redeployButton])
    }
    if (isStopAvailable(status)) {
      setTopMenu((topMenu) => [...topMenu, stopButton])
    }
    if (isUpdateAvailable(status)) {
      setBottomMenu((bottomMenu) => [...bottomMenu, updateButton])
    }
    if (isRollbackAvailable(status)) {
      setBottomMenu((bottomMenu) => [...bottomMenu, rollbackButton])
    }
    if (isCancelBuildAvailable(status)) {
      setBottomMenu((bottomMenu) => [...bottomMenu, cancelBuildButton])
    }
    if (isDeleteAvailable(status)) {
      setBottomMenu((bottomMenu) => [...bottomMenu, removeButton])
    }
  }, [])

  const menus = bottomMenu.length === 0 ? [{ items: topMenu }] : [{ items: topMenu }, { items: bottomMenu }]

  return (
    <Menu
      trigger={trigger}
      menus={menus}
      width={width}
      paddingMenuX={paddingMenuX}
      paddingMenuY={paddingMenuY}
      className={className}
      direction={direction}
      arrowAlign={arrowAlign}
      onOpen={(isOpen) => setOpen && setOpen(isOpen)}
    />
  )
}

export default StatusMenuAction
