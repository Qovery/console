import Icon from '../icon/icon'
import Menu from '../menu/menu'

export enum StatusMenuState {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  ERROR = 'Error',
  STARTING = 'Starting',
  STOPPING = 'Stopping',
}

export interface StatusMenuProps {
  status: StatusMenuState
}

export function StatusMenu(props: StatusMenuProps) {
  const { status = StatusMenuState.RUNNING } = props

  const containerClassName = () => {
    switch (status) {
      case StatusMenuState.RUNNING:
        return 'bg-success-50 border-success-500 text-success-500'
      case StatusMenuState.STOPPED:
        return 'bg-element-light-lighter-300 border-element-light-lighter-700 text-text-400'
      case StatusMenuState.ERROR:
        return 'bg-error-50 border-error-400 text-error-500'
      case StatusMenuState.STARTING || StatusMenuState.STOPPING:
        return 'bg-progressing-50 border-progressing-400 text-progressing-500'
      default:
        return 'bg-success-50 border-success-500 text-success-500'
    }
  }

  const iconStatus = () => {
    switch (status) {
      case StatusMenuState.RUNNING:
        return <Icon name="icon-solid-play" className="text-xs text-inherit" />
      case StatusMenuState.STOPPED:
        return <Icon name="icon-solid-circle-stop" className="text-xs text-inherit" />
      case StatusMenuState.ERROR:
        return <Icon name="icon-solid-circle-exclamation" className="text-xs text-inherit" />
      case StatusMenuState.STARTING || StatusMenuState.STOPPING:
        return <Icon name="icon-solid-play" className="text-xs text-inherit" />
      default:
        return <Icon name="icon-solid-play" className="text-xs text-inherit" />
    }
  }

  const actionsMenu = [
    {
      items: [
        {
          name: 'Deploy',
          link: {
            url: '/',
          },
          contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
        },
        {
          name: 'Stop',
          link: {
            url: '/',
          },
          contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Redeploy',
          link: {
            url: '/',
          },
          contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
        },
        {
          name: 'Update applications',
          link: {
            url: '/',
          },
          contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
        },
        {
          name: 'Rollback',
          link: {
            url: '/',
          },
          contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  return (
    <div className={`h-6 inline-flex items-center px-2 border rounded ${containerClassName()}`}>
      <p className="text-xs font-semibold">{status}</p>
      <div className={`h-full inline-flex items-center pl-2 border-l ml-2 ${containerClassName()}`}>
        <Menu
          menus={actionsMenu}
          width={248}
          trigger={
            <div className="flex items-center gap-1 cursor-pointer">
              {iconStatus()} <Icon name="icon-solid-angle-down" className="text-xs" />
            </div>
          }
        />
      </div>
    </div>
  )
}

export default StatusMenu
