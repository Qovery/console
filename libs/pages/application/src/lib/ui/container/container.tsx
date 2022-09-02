import { Environment } from 'qovery-typescript-axios'
import { createContext, useState } from 'react'
import { useParams } from 'react-router'
import { IconEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import {
  Button,
  ButtonIconAction,
  ButtonSize,
  ButtonStyle,
  Header,
  Icon,
  Menu,
  MenuData,
  MenuItemProps,
  Skeleton,
  StatusMenuActions,
  Tag,
  TagMode,
  TagSize,
} from '@console/shared/ui'
import { copyToClipboard } from '@console/shared/utils'
import TabsFeature from '../../feature/tabs-feature/tabs-feature'

export const ApplicationContext = createContext<{
  showHideAllEnvironmentVariablesValues: boolean
  setShowHideAllEnvironmentVariablesValues: (b: boolean) => void
}>({
  showHideAllEnvironmentVariablesValues: false,
  setShowHideAllEnvironmentVariablesValues: (b: boolean) => {},
})

export interface ContainerProps {
  statusActions: StatusMenuActions[]
  application?: ApplicationEntity
  environment?: Environment
  children?: React.ReactNode
  removeApplication?: (applicationId: string) => void
}

export function Container(props: ContainerProps) {
  const { application, environment, children, statusActions, removeApplication } = props
  const { organizationId, projectId, environmentId, applicationId } = useParams()
  const [showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues] = useState<boolean>(false)

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${applicationId}`

  const menuLink: MenuData = []

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      statusActions: {
        status: application?.status && application?.status.state,
        actions: statusActions,
      },
    },
    {
      iconLeft: <Icon name="icon-solid-scroll" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
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
    {
      ...(removeApplication && {
        iconLeft: <Icon name="icon-solid-ellipsis-v" className="px-0.5" />,
        menus: [
          {
            items: [
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeApplication(applicationId ? applicationId : ''),
              },
              {
                name: 'Copy identifiers',
                contentLeft: <Icon name="icon-solid-copy" className="text-sm text-brand-400" />,
                onClick: () => copyToClipboard(copyContent),
              },
            ],
          },
        ],
      }),
    },
  ]

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

  const headerButtons = (
    <div className="flex items-start gap-2">
      {/*<ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />*/}
      {/*<ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />*/}
      {/*<ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />*/}
      {application?.links && application.links.items && application.links.items.length > 0 && (
        <Menu
          menus={menuLink}
          trigger={
            <Button iconRight="icon-solid-link" style={ButtonStyle.STROKED} size={ButtonSize.SMALL}>
              Open links
            </Button>
          }
        />
      )}
    </div>
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={24} show={!application?.status}>
        <div className="flex">
          {environment && application && application?.status && (
            <>
              <ButtonIconAction
                className="!h-8"
                actions={buttonActionsDefault}
                statusInformation={{
                  id: application?.id,
                  name: application?.name,
                  mode: environment?.mode,
                }}
              />
              <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-element-light-lighter-400"></span>
            </>
          )}
        </div>
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

  return (
    <ApplicationContext.Provider
      value={{ showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues }}
    >
      <Header title={application?.name} icon={IconEnum.APPLICATION} buttons={headerButtons} actions={headerActions} />
      <TabsFeature />
      {children}
    </ApplicationContext.Provider>
  )
}

export default Container
