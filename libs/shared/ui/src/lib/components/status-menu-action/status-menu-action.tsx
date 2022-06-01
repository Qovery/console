import { Icon, ModalContext, ModalConfirmation } from '@console/shared/ui'
import {
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRestartAvailable,
  isStopAvailable,
} from '@console/shared/utils'
import { ClickEvent } from '@szhsin/react-menu'
import { EnvironmentModeEnum, GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { useState, useEffect, useContext } from 'react'
import Menu, { MenuAlign, MenuDirection } from '../menu/menu'

export interface StatusMenuActionProps {
  trigger: React.ReactElement
  statusActions: {
    status: GlobalDeploymentStatus | undefined
    actions: any
  }
  rowInformation?: StatusMenuRowInformation
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

export type StatusMenuRowInformation = {
  id: string | undefined
  name: string | undefined
  mode: string | undefined
}

export type StatusMenuActions = {
  name: string
  action: () => void
}

export function StatusMenuAction(props: StatusMenuActionProps) {
  const {
    statusActions,
    rowInformation,
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

  const onClickAction = (name: string, titleModal: string, descriptionModal: string) => {
    const currentAction = statusActions.actions.find((action: StatusMenuActions) => action.name === name)
    const actionDeploy = () => rowInformation && currentAction.action(rowInformation.id)

    if (currentAction.mode === EnvironmentModeEnum.PRODUCTION) {
      setOpenModal(true)
      setContentModal(
        <ModalConfirmation
          title={titleModal}
          description={descriptionModal}
          name={rowInformation?.name}
          callback={() => actionDeploy()}
        />
      )
    } else {
      actionDeploy()
    }
  }

  const deployButton = {
    name: 'Deploy',
    onClick: (e: ClickEvent) => {
      e.syntheticEvent.preventDefault()
      onClickAction('deploy', 'Confirm deploy', 'To confirm the deploy of your environment, please type the name:')
    },
    contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
  }

  const stopButton = {
    name: 'Stop',
    onClick: (e: ClickEvent) => {
      e.syntheticEvent.preventDefault()
      onClickAction('deploy', 'Confirm stop', 'To confirm the stop of your environment, please type the name:')
    },
    contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
  }

  const redeployButton = {
    name: 'Redeploy',
    onClick: (e: ClickEvent) => {
      e.syntheticEvent.preventDefault()
      onClickAction(
        'redeploy',
        'Confirm redeploy',
        'To confirm the redeploy of your environment, please type the name:'
      )
    },
    contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
  }

  const cancelBuildButton = {
    name: 'Cancel Build',
    onClick: (e: ClickEvent) => {
      e.syntheticEvent.preventDefault()
      onClickAction(
        'cancel-build',
        'Confirm cancel deployment',
        'To confirm the cancel deployment of your environment, please type the name:'
      )
    },
    contentLeft: <Icon name="icon-solid-xmark" className="text-sm text-brand-400" />,
  }

  const removeButton = {
    name: 'Remove',
    onClick: (e: ClickEvent) => console.log(e),
    contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
  }

  useEffect(() => {
    if (statusActions.status) {
      if (isDeployAvailable(statusActions.status)) {
        setTopMenu((topMenu) => [...topMenu, deployButton])
      }
      if (isRestartAvailable(statusActions.status)) {
        setTopMenu((topMenu) => [...topMenu, redeployButton])
      }
      if (isStopAvailable(statusActions.status)) {
        setTopMenu((topMenu) => [...topMenu, stopButton])
      }
      if (isCancelBuildAvailable(statusActions.status)) {
        setBottomMenu((bottomMenu) => [...bottomMenu, cancelBuildButton])
      }
      if (isDeleteAvailable(statusActions.status)) {
        setBottomMenu((bottomMenu) => [...bottomMenu, removeButton])
      }
    }
  }, [statusActions.status])

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
