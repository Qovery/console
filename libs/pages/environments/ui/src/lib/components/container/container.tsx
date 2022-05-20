import { useLocation, useParams } from 'react-router'
import { ENVIRONMENTS_URL, ENVIRONMENTS_DEPLOYMENT_RULES_URL } from '@console/shared/utils'
import { ButtonIcon, ButtonIconStyle, Header, ButtonAction, Icon, Tabs, Button, ButtonSize } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'
import { ClickEvent } from '@szhsin/react-menu'

export interface ContainerProps {
  children: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { children } = props
  const { organizationId, projectId } = useParams()
  const location = useLocation()

  const headerButtons = (
    <div className="hidden">
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </div>
  )

  const tabsItems = [
    {
      icon: <Icon name={IconEnum.SUCCESS} viewBox="0 0 16 16" className="w-4 mt-0.5" />,
      name: 'Environments',
      active: location.pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}/general`,
      link: `${ENVIRONMENTS_URL(organizationId, projectId)}/general`,
    },
    {
      icon: <Icon name="icon-solid-browser" className="text-sm text-inherit" />,
      name: 'Deployment Rules',
      active:
        location.pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`,
      link: `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`,
    },
  ]

  const menusButton = [
    {
      items: [
        {
          name: 'Deploy',
          onClick: (e: ClickEvent) => console.log(e),
          contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
        },
        {
          name: 'Stop',
          onClick: (e: ClickEvent) => console.log(e),
          contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Redeploy',
          onClick: (e: ClickEvent) => console.log(e),
          contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
        },
        {
          name: 'Update applications',
          onClick: (e: ClickEvent) => console.log(e),
          contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
        },
        {
          name: 'Rollback',
          onClick: (e: ClickEvent) => console.log(e),
          contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  const isDeploymentRulesTab =
    location.pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      {!isDeploymentRulesTab ? (
        <ButtonAction menus={menusButton} iconRight="icon-solid-plus">
          New environment
        </ButtonAction>
      ) : (
        <Button size={ButtonSize.SMALL} className="leading-none">
          New rule
          <Icon name="icon-solid-plus" className="ml-2 !text-base inline-block -mt-1" />
        </Button>
      )}
    </div>
  )

  return (
    <div>
      <Header title="Environments" icon={IconEnum.ENVIRONMENT} buttons={headerButtons} />
      <Tabs items={tabsItems} contentRight={contentTabs} />
      {children}
    </div>
  )
}

export default Container
