import { ClickEvent } from '@szhsin/react-menu'
import { StateEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Icon, useModalConfirmation } from '@qovery/shared/ui'
import { isCancelBuildAvailable, isDeployAvailable, isRestartAvailable, isStopAvailable } from '@qovery/shared/utils'
import Menu, { MenuAlign, MenuDirection } from '../menu/menu'

export interface StatusMenuActionProps {
  trigger: React.ReactElement
  statusActions: {
    status: StateEnum
    actions: StatusMenuActions[]
    information?: StatusMenuInformation
  }
  width?: number
  direction?: MenuDirection
  arrowAlign?: MenuAlign
  className?: string
  paddingMenuY?: number
  paddingMenuX?: number
  setOpen?: (isOpen: boolean) => void
  isService?: boolean
}

export type StatusMenuActionItem = {
  name: string
  onClick: (e: ClickEvent) => void
  contentLeft: React.ReactNode
}

export type StatusMenuInformation = {
  id?: string
  name?: string
  mode?: string
}

export type StatusMenuActions = {
  name: string
  action: (id: string) => void
}

export function StatusMenuAction(props: StatusMenuActionProps) {
  const {
    statusActions,
    trigger,
    width = 340,
    paddingMenuX = 12,
    paddingMenuY = 12,
    className = '',
    direction = MenuDirection.BOTTOM,
    arrowAlign = MenuAlign.START,
    setOpen,
    isService,
  } = props
  const [topMenu, setTopMenu] = useState<StatusMenuActionItem[]>([])
  const [bottomMenu, setBottomMenu] = useState<StatusMenuActionItem[]>([])

  const { openModalConfirmation } = useModalConfirmation()

  const onClickAction = (state: string, titleModal: string, descriptionModal: string) => {
    const currentAction = statusActions.actions.find((action: StatusMenuActions) => action.name === state)
    const actionDeploy = () =>
      currentAction && statusActions.information && currentAction.action(statusActions.information?.id || '')

    openModalConfirmation({
      mode: statusActions?.information?.mode,
      title: titleModal,
      description: descriptionModal,
      name: statusActions?.information?.name,
      action: () => actionDeploy(),
    })
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
      onClickAction('stop', 'Confirm stop', 'To confirm the stop of your environment, please type the name:')
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
    name: 'Cancel Deployment',
    onClick: (e: ClickEvent) => {
      e.syntheticEvent.preventDefault()
      onClickAction(
        'cancel-deployment',
        'Confirm cancel deployment',
        'To confirm the cancel deployment of your environment, please type the name:'
      )
    },
    contentLeft: <Icon name="icon-solid-xmark" className="text-sm text-brand-400" />,
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
      if (!isService && isCancelBuildAvailable(statusActions.status)) {
        setBottomMenu((bottomMenu) => [...bottomMenu, cancelBuildButton])
      }
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
