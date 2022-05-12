import { Application, Environment, EnvironmentModeEnum, GlobalDeploymentStatus, Status } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { APPLICATION_URL, APPLICATIONS_URL } from '@console/shared/utils'
import {
  ButtonAction,
  ButtonIcon,
  ButtonIconStyle,
  Header,
  Icon,
  Skeleton,
  StatusChip,
  StatusMenu,
  Tabs,
  Tag,
  TagMode,
} from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'
import { ClickEvent } from '@szhsin/react-menu'
import { ApplicationEntity, EnvironmentEntity } from '@console/shared/interfaces'

export interface ContainerProps {
  applications: ApplicationEntity[]
  environment?: EnvironmentEntity
}

export function Container(props: ContainerProps) {
  const { applications, environment } = props
  const { organizationId, projectId, environmentId } = useParams()
  const location = useLocation()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}`

  const headerButtons = (
    <div className="hidden">
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </div>
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={24} show={!environment?.status}>
        <StatusMenu status={environment?.status ? environment?.status.state : GlobalDeploymentStatus.RUNNING} />
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={24} show={!environment?.mode}>
          <TagMode status={environment?.mode} />
        </Skeleton>
      )}
      <Skeleton width={100} height={24} show={!environment?.cloud_provider}>
        <div className="border border-element-light-lighter-400 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium mt-[1px] gap-2">
          <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
          <p className="max-w-[54px] truncate">{environment?.cloud_provider.cluster}</p>
        </div>
      </Skeleton>
      <Tag className="bg-element-light-lighter-300 gap-2 hidden">
        <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
        <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
      </Tag>
    </>
  )

  const tabsItems = [
    {
      icon: (
        <Skeleton width={16} height={16} rounded show={!environment?.status}>
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
      <Skeleton width={154} height={32} show={!environment?.status}>
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
