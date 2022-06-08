import { StateEnum } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { SERVICES_GENERAL_URL, SERVICES_URL, SERVICES_DEPLOYMENTS_URL } from '@console/shared/router'
import {
  ButtonAction,
  ButtonIcon,
  ButtonIconStyle,
  Header,
  Icon,
  Skeleton,
  StatusChip,
  StatusMenu,
  StatusMenuActions,
  Tabs,
  Tag,
  TagMode,
} from '@console/shared/ui'
import { IconEnum, RunningStatus } from '@console/shared/enums'
import { EnvironmentEntity } from '@console/shared/interfaces'

export interface ContainerProps {
  statusActions: StatusMenuActions[]
  environment?: EnvironmentEntity
  children?: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { environment, children, statusActions } = props
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
        {environment?.status ? (
          <StatusMenu
            statusActions={{
              status: environment?.status ? environment?.status.state : StateEnum.RUNNING,
              running_status: environment?.running_status?.state || RunningStatus.STOPPED,
              actions: statusActions,
              information: {
                id: environment?.id,
                name: environment?.name,
                mode: environment?.mode,
              },
            }}
          />
        ) : (
          <div />
        )}
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={24} show={!environment?.mode}>
          <TagMode status={environment?.mode} />
        </Skeleton>
      )}
      <Skeleton width={100} height={24} show={!environment?.cloud_provider}>
        <div className="border border-element-light-lighter-400 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium gap-2">
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
        <StatusChip
          status={(environment?.running_status && environment?.running_status.state) || RunningStatus.STOPPED}
        />
      ),
      name: 'Overview',
      active: location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
    },
    {
      icon: (
        <Skeleton width={16} height={16} rounded show={!environment?.status}>
          <StatusChip status={environment?.status && environment?.status.state} />
        </Skeleton>
      ),
      name: 'Deployments',
      active:
        location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
    },
  ]

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <Skeleton width={154} height={32} show={!environment?.status}>
        {environment?.status ? <ButtonAction iconRight="icon-solid-plus">New service</ButtonAction> : <div />}
      </Skeleton>
    </div>
  )

  return (
    <div>
      <Header
        title={environment?.name}
        icon={IconEnum.APPLICATION}
        buttons={headerButtons}
        copyTitle
        copyContent={copyContent}
        actions={headerActions}
      />
      <Tabs items={tabsItems} contentRight={contentTabs} />
      {children}
    </div>
  )
}

export default Container
