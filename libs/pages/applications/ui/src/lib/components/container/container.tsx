import { Application, Environment, GlobalDeploymentStatus, Status } from 'qovery-typescript-axios'
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
  Tabs,
  Tag,
  StatusChip,
  Skeleton,
} from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'
import { ClickEvent } from '@szhsin/react-menu'

export interface ContainerProps {
  applications: Application[]
  environment?: Environment & { status?: Status }
}

export function Container(props: ContainerProps) {
  const { applications, environment } = props
  const { organizationId, projectId, environmentId } = useParams()
  const location = useLocation()

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

  const headerActions = (
    <>
      <Skeleton width={150} height={24} show={environment?.status ? false : true}>
        <StatusMenu status={environment?.status ? environment?.status.state : GlobalDeploymentStatus.RUNNING} />
      </Skeleton>
      <Skeleton width={80} height={24} show={environment?.mode ? false : true}>
        <Tag className="bg-brand-50 text-brand-500">{environment?.mode}</Tag>
      </Skeleton>
      <Skeleton width={100} height={24} show={environment?.cloud_provider ? false : true}>
        <div className="border border-element-light-lighter-400 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium gap-2">
          <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
          <p className="max-w-[54px] truncate">{environment?.cloud_provider.cluster}</p>
        </div>
      </Skeleton>
      <Tag className="bg-element-light-lighter-300 gap-2">
        <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
        <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
      </Tag>
    </>
  )

  const tabsItems = [
    {
      icon: (
        <Skeleton width={16} height={16} rounded show={environment?.status ? false : true}>
          <StatusChip status={environment?.status && environment?.status.state} />
        </Skeleton>
      ),
      name: 'Environments',
      active: location.pathname === APPLICATIONS_URL(organizationId, projectId, environmentId),
      link: APPLICATIONS_URL(organizationId, projectId, environmentId),
    },
  ]

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <Skeleton width={154} height={32} show={environment?.status ? false : true}>
        <ButtonAction status={environment?.status && environment?.status.state} iconRight="icon-solid-plus">
          New service
        </ButtonAction>
      </Skeleton>
    </div>
  )

  return (
    <div>
      <Header
        title={environment?.name}
        icon={IconEnum.APPLICATIONS}
        buttons={headerButtons}
        copyTitle
        copyContent={copyContent}
        actions={headerActions}
      />
      <Tabs items={tabsItems} contentRight={contentTabs} />
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
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Container
