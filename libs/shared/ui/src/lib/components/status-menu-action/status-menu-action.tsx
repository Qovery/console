import { ClickEvent, MenuItem as Item } from '@szhsin/react-menu'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { useState, useEffect } from 'react'
import { Icon } from '@console/shared/ui'
import {
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRestartAvailable,
  isRollbackAvailable,
  isStopAvailable,
  isUpdateAvailable,
} from '@console/shared/utils'
import Menu, { MenuAlign, MenuDirection } from '../menu/menu'
import { MenuItemProps } from '../menu/menu-item/menu-item'
import Modal from '../modal/modal'
import { ModalConfirmation } from '../modals/modal-confirmation/modal-confirmation'

export interface StatusMenuActionParamsProps {
  name: string
  status: GlobalDeploymentStatus
  mode?: string
  environmentId?: string
  applicationId?: string
}

export interface StatusMenuActionProps {
  trigger: React.ReactElement
  action: StatusMenuActionParamsProps
  width?: number
  direction?: MenuDirection
  arrowAlign?: MenuAlign
  className?: string
  paddingMenuY?: number
  paddingMenuX?: number
  setOpen?: (isOpen: boolean) => void
}

export function StatusMenuAction(props: StatusMenuActionProps) {
  const {
    trigger,
    action,
    width = 340,
    paddingMenuX = 12,
    paddingMenuY = 12,
    className = '',
    direction = MenuDirection.BOTTOM,
    arrowAlign = MenuAlign.START,
    setOpen,
  } = props
  const [topMenu, setTopMenu] = useState<MenuItemProps[]>([])
  const [bottomMenu, setBottomMenu] = useState<MenuItemProps[]>([])

  const { status, name } = action

  const customContentModal = (title: string, description: string) => (
    <Modal
      width={488}
      trigger={
        <Item className="menu-item">
          <div>
            <Icon name="icon-solid-play" className="text-sm text-brand-400 mr-3" />
            <span className="text-sm text-text-500 font-medium">{title}</span>
          </div>
        </Item>
      }
    >
      <ModalConfirmation
        title={title}
        description={description}
        name={name}
        callback={() => {
          console.log('callback')
        }}
      />
    </Modal>
  )

  const deployButton = {
    name: 'Deploy',
    customContent: customContentModal(
      'Deploy',
      'To confirm the deploy of your environment, please type the name of the environment:'
    ),
  }

  const redeployButton = {
    name: 'Redeploy',
    customContent: customContentModal(
      'Redeploy',
      'To confirm the redeploy of your environment, please type the name of the environment:'
    ),
  }

  const stopButton = {
    name: 'Stop',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
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
