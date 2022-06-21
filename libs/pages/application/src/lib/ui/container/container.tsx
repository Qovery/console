import { IconEnum, RunningStatus } from '@console/shared/enums'
import {
  Button,
  ButtonIconAction,
  ButtonSize,
  ButtonStyle,
  Header,
  Icon,
  Menu,
  MenuAlign,
  MenuData,
  MenuItemProps,
  Skeleton,
  StatusChip,
  StatusMenu,
  StatusMenuActions,
  Tabs,
  Tag,
  TagMode,
} from '@console/shared/ui'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
} from '@console/shared/router'
import { Environment } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { ApplicationEntity } from '@console/shared/interfaces'

//import { ClickEvent } from '@szhsin/react-menu'

export interface ContainerProps {
  statusActions: StatusMenuActions[]
  application?: ApplicationEntity
  environment?: Environment
  children?: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { application, environment, children, statusActions } = props
  const { organizationId, projectId, environmentId, applicationId } = useParams()
  const location = useLocation()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${applicationId}`

  const menuLink: MenuData = []

  if (application && application.links && application.links.items) {
    const items: MenuItemProps[] = application.links.items.map((link) => {
      return {
        name: link.url || '',
        link: {
          url: link.url || '',
          external: true,
        },
        copy: link.url || undefined,
        copyTooltip: 'Copy the link',
      }
    })

    menuLink.push({
      title: 'Links',
      items,
    })
  }

  const linkButtons = () => {
    if (application?.links && application.links.items && application.links.items.length === 1) {
      return (
        <Button
          iconRight="icon-solid-link"
          external={true}
          link={application.links.items[0].url}
          style={ButtonStyle.STROKED}
          size={ButtonSize.SMALL}
        >
          Open link
        </Button>
      )
    } else {
      return (
        <Menu
          menus={menuLink}
          trigger={
            <Button iconRight="icon-solid-link" style={ButtonStyle.STROKED} size={ButtonSize.SMALL}>
              Open links
            </Button>
          }
        />
      )
    }
  }

  const openLogsActions = [
    {
      iconLeft: <Icon name="icon-solid-scroll" className="text-text-500" />,
      iconRight: <Icon name="icon-solid-angle-down" className="text-text-500" />,
      menuAlign: MenuAlign.END,
      triggerClassName:
        '!bg-element-light-lighter-300 border-element-light-lighten-500 !hover:bg-element-light-lighter-400',
      menus: [
        {
          items: [
            {
              name: 'Deployment logs',
              contentLeft: <Icon name="icon-solid-scroll" className="text-brand-500 text-sm" />,
              onClick: () =>
                window
                  .open(
                    `https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications?fullscreenLogs=true`,
                    '_blank'
                  )
                  ?.focus(),
            },
            {
              name: 'Application logs',
              contentLeft: <Icon name="icon-solid-scroll" className="text-brand-500 text-sm" />,
              onClick: () =>
                window
                  .open(
                    `https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications/${applicationId}/summary?fullscreenLogs=true`,
                    '_blank'
                  )
                  ?.focus(),
            },
          ],
        },
      ],
    },
  ]

  const headerButtons = (
    <div className="flex items-start gap-2">
      {/*<ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />*/}
      {/*<ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />*/}
      {/*<ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />*/}
      <ButtonIconAction actions={openLogsActions} className="!h-8" />
      {application?.links && application.links.items && application.links.items.length > 0 && linkButtons()}
    </div>
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={24} show={!application?.status}>
        <div className="flex">
          {environment && application && application?.status && (
            <StatusMenu
              statusActions={{
                status: application?.status.state,
                running_status: application?.running_status?.state || RunningStatus.STOPPED,
                actions: statusActions,
                information: {
                  id: application?.id,
                  name: application?.name,
                  mode: environment?.mode,
                },
              }}
            />
          )}
        </div>
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
          status={(application?.running_status && application?.running_status.state) || RunningStatus.STOPPED}
          appendTooltipMessage={
            application?.running_status?.state === RunningStatus.ERROR
              ? application.running_status.pods[0]?.state_message
              : ''
          }
        />
      ),
      name: 'Overview',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
    },
    {
      icon: (
        <StatusChip
          status={(application?.running_status && application?.running_status.state) || RunningStatus.STOPPED}
          appendTooltipMessage={
            application?.running_status?.state === RunningStatus.ERROR
              ? application.running_status.pods[0]?.state_message
              : ''
          }
        />
      ),
      name: 'Deployments',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL,
    },
    /*{
      icon: <Icon name="icon-solid-chart-area" />,
      name: 'Metrics',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_METRICS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_METRICS_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Variables',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
    },*/
  ]

  return (
    <>
      <Header
        title={application?.name}
        icon={IconEnum.APPLICATION}
        buttons={headerButtons}
        copyTitle
        copyContent={copyContent}
        actions={headerActions}
      />
      <Tabs items={tabsItems} />
      {children}
    </>
  )
}

export default Container
