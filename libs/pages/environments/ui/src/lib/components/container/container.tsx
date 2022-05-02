import { Environment } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { APPLICATIONS_URL } from '@console/shared/utils'
import { ButtonIcon, ButtonIconStyle, Header, Table, ButtonAction, Icon, Tabs } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'
import TableRowEnvironments from '../table-row-environments/table-row-environments'

export interface ContainerProps {
  environments: Environment[]
  children: React.ReactNode
}

const tableHead = [
  {
    title: 'Environment',
    className: 'px-4 py-2',
  },
  {
    title: 'Update',
    className: 'px-4 text-center',
  },
  {
    title: 'Running Schedule',
    className: 'px-4 py-2 border-b-element-light-lighter-400 border-l',
  },
  {
    title: 'Type',
  },
  {
    title: 'Tags',
  },
]

export function Container(props: ContainerProps) {
  const { environments, children } = props
  const { organizationId, projectId } = useParams()
  const location = useLocation()

  const headerButtons = (
    <>
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </>
  )

  const tabsItems = [
    {
      icon: <Icon name={IconEnum.CHECKCIRCLE} width="14" />,
      name: 'Environments',
      active: location.pathname === ENVIRONMENTS_URL(organizationId, projectId),
      link: ENVIRONMENTS_URL(organizationId, projectId),
    },
    {
      icon: <Icon name="icon-solid-browser" className="text-sm text-inherit" />,
      name: 'Deployment Rules',
      active: location.pathname === ENVIRONMENTS_DEPLOYMENT_RULES_URL(organizationId, projectId),
      link: ENVIRONMENTS_DEPLOYMENT_RULES_URL(organizationId, projectId),
    },
  ]

  const clickAction = (e: ClickEvent, status: string) => {
    console.log(e, status)
  }

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
        New environment
      </ButtonAction>
    </div>
  )

  return (
    <div>
      <Header title="Environments" icon={IconEnum.ENVIRONMENT} buttons={headerButtons} />
      <Tabs items={tabsItems} contentRight={contentTabs} />
      <Table className="mt-2 bg-white rounded-sm" dataHead={tableHead} columnsWidth="30% 15% 25% 10% 20%">
        <>
          {environments.map((currentData, index) => (
            <TableRowEnvironments
              key={index}
              data={currentData}
              dataHead={tableHead}
              link={APPLICATIONS_URL(organizationId, projectId, currentData.id)}
              columnsWidth="25% 20% 25% 10% 15%"
            />
      <ul className="mt-8">
        {environments &&
          environments.map((environment: Environment) => (
            <li key={environment.id}>
              <Link className="link text-accent2-500" to={APPLICATIONS_URL(organizationId, projectId, environment.id)}>
                {environment.name}
              </Link>
            </li>
          ))}
        </>
      </Table>
    </div>
  )
}

export default Container
