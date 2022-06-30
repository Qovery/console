import { useLocation, useParams } from 'react-router'
import {
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
} from '@console/shared/router'
import {
  ButtonAction,
  //ButtonIcon,
  ButtonIconAction,
  //ButtonIconStyle,
  Header,
  Icon,
  Skeleton,
  StatusChip,
  StatusMenuActions,
  Tabs,
  Tag,
  TagMode,
  TagSize,
} from '@console/shared/ui'
import { IconEnum, RunningStatus } from '@console/shared/enums'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { StateEnum } from 'qovery-typescript-axios'

export interface ContainerProps {
  statusActions: StatusMenuActions[]
  environment?: EnvironmentEntity
  children?: React.ReactNode
  removeEnvironment?: () => void
}

export function Container(props: ContainerProps) {
  const { environment, children, statusActions, removeEnvironment } = props
  const { organizationId, projectId, environmentId } = useParams()
  const location = useLocation()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}`

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      statusActions: {
        status: environment?.status && environment?.status.state,
        actions: statusActions,
      },
    },
    {
      iconLeft: <Icon name="icon-solid-scroll" className="px-0.5" />,
      onClick: () =>
        window.open(
          `https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications?fullscreenLogs=true`,
          '_blank'
        ),
    },
    {
      ...(removeEnvironment && {
        iconLeft: <Icon name="icon-solid-ellipsis-vertical" />,
        menus: [
          {
            items: [
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeEnvironment(),
              },
            ],
          },
        ],
      }),
    },
  ]

  const headerButtons = (
    <div>
      {/* <ButtonIcon
        icon="icon-solid-scroll"
        style={ButtonIconStyle.STROKED}
        link={`https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications?fullscreenLogs=true`}
        external
      />
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} /> 
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} /> */}
    </div>
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={24} show={!environment?.status}>
        {environment?.status ? (
          <>
            <ButtonIconAction
              className="!h-8"
              actions={buttonActionsDefault}
              statusInformation={{
                id: environment?.id,
                name: environment?.name,
                mode: environment?.mode,
              }}
            />
            <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-element-light-lighter-400"></span>
          </>
        ) : (
          <div />
        )}
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={24} show={!environment?.mode}>
          <TagMode size={TagSize.BIG} status={environment?.mode} />
        </Skeleton>
      )}
      <Skeleton width={100} height={24} show={!environment?.cloud_provider}>
        <div className="border border-element-light-lighter-400 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
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
        <Skeleton show={environment?.status?.state === StateEnum.STOPPING} width={16} height={16} rounded={true}>
          <StatusChip status={(environment?.status && environment?.status.state) || StateEnum.STOPPED} />
        </Skeleton>
      ),
      name: 'Deployments',
      active:
        location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active: location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`,
    },
  ]

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <Skeleton width={154} height={32} show={!environment?.status}>
        {environment?.status ? (
          <ButtonAction
            iconRight="icon-solid-plus"
            external
            link={`https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications`}
          >
            New service
          </ButtonAction>
        ) : (
          <div />
        )}
      </Skeleton>
    </div>
  )

  return (
    <>
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
    </>
  )
}

export default Container
