import { Application } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { APPLICATIONS_URL, APPLICATION_URL } from '@console/shared/utils'
import {
  ButtonIcon,
  ButtonIconStyle,
  ButtonAction,
  Header,
  Icon,
  StatusMenu,
  StatusMenuState,
  Tabs,
  Tag,
} from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'
import { ClickEvent } from '@szhsin/react-menu'
import { useDispatch } from 'react-redux'
import { useApplications } from '@console/domains/application'

export interface ContainerProps {
  applications: Application[]
}

export function Container(props: ContainerProps) {
  const { applications } = props
  const { organizationId, projectId, environmentId } = useParams()
  const location = useLocation()

  // todo to remove
  const { removeApplication } = useApplications()

  const dispatch = useDispatch<any>()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}`

  const headerButtons = (
    <>
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </>
  )

  const clickAction = (e: ClickEvent, action: string) => {
    console.log(e)
  }

  const actionsMenu = [
    {
      items: [
        {
          name: 'Deploy',
          onClick: (e: ClickEvent) => clickAction(e, 'Deploy'),
          contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
        },
        {
          name: 'Stop',
          onClick: (e: ClickEvent) => clickAction(e, 'Stop'),
          contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Redeploy',
          onClick: (e: ClickEvent) => clickAction(e, 'Redeploy'),
          contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
        },
        {
          name: 'Update applications',
          onClick: (e: ClickEvent) => clickAction(e, 'Update'),
          contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
        },
        {
          name: 'Rollback',
          onClick: (e: ClickEvent) => clickAction(e, 'Rollblack'),
          contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  const headerActions = (
    <>
      <StatusMenu menus={actionsMenu} status={StatusMenuState.RUNNING} />
      <Tag className="bg-brand-50 text-brand-500">PROD</Tag>
      <div className="border border-element-light-lighter-400 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium gap-2">
        <Icon name={IconEnum.AWS} width="16" />
        <p className="max-w-[54px] truncate">community-test</p>
      </div>
      <Tag className="bg-element-light-lighter-300 gap-2">
        <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
        <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
      </Tag>
    </>
  )

  /*const tabsItems = [
    {
      icon: <Icon name={IconEnum.CHECKCIRCLE} width="14" />,
      name: 'Environments',
      active: location.pathname === APPLICATIONS_URL(organizationId, projectId, environmentId),
      link: APPLICATIONS_URL(organizationId, projectId, environmentId),
    },
    {
      icon: <Icon name={IconEnum.CHECKCIRCLE} width="14" />,
      name: 'Deployments',
      active: location.pathname === APPLICATIONS_DEPLOYMENTS_URL(organizationId, projectId, environmentId),
      link: APPLICATIONS_DEPLOYMENTS_URL(organizationId, projectId, environmentId),
    },
    {
      icon: <Icon name="icon-solid-wheel" className="text-sm" />,
      name: 'Settings',
      active: location.pathname === APPLICATIONS_SETTINGS_URL(organizationId, projectId, environmentId),
      link: APPLICATIONS_SETTINGS_URL(organizationId, projectId, environmentId),
    },
  ]*/

  const menusButton = [
    {
      items: [
        {
          name: 'Deploy',
          onClick: (e: ClickEvent) => clickAction(e, 'Deploy'),
          contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
        },
        {
          name: 'Stop',
          onClick: (e: ClickEvent) => clickAction(e, 'Stop'),
          contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Redeploy',
          onClick: (e: ClickEvent) => clickAction(e, 'Redeploy'),
          contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
        },
        {
          name: 'Update applications',
          onClick: (e: ClickEvent) => clickAction(e, 'Update'),
          contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
        },
        {
          name: 'Rollback',
          onClick: (e: ClickEvent) => clickAction(e, 'Rollblack'),
          contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <ButtonAction menus={menusButton} iconRight="icon-solid-plus">
        New service
      </ButtonAction>
    </div>
  )

  return (
    <div>
      <Header
        title="Applications"
        icon={IconEnum.APPLICATIONS}
        buttons={headerButtons}
        copyTitle
        copyContent={copyContent}
        actions={headerActions}
      />
      <Tabs items={[]} contentRight={contentTabs} />
      <ul className="mt-8">
        {applications &&
          applications.map((application: Application) => (
            <li key={application.id}>
              <Link
                className="link text-accent2-500"
                to={APPLICATION_URL(organizationId, projectId, environmentId, application.id)}
              >
                {application.name}
              </Link>
              <button
                onClick={async () => {
                  await removeApplication(application.id)
                }}
              >
                test deletion
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Container
