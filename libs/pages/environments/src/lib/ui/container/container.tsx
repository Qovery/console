import { useLocation, useParams } from 'react-router'
import {
  ENVIRONMENTS_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_SETTINGS_URL,
} from '@console/shared/router'
import { ButtonIcon, ButtonIconStyle, Header, ButtonAction, Icon, Tabs } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'

export interface ContainerProps {
  children: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { children } = props
  const { organizationId, projectId } = useParams()
  const { pathname } = useLocation()

  const headerButtons = (
    <div className="hidden">
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
    </div>
  )

  const isDeploymentRulesTab =
    pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}` ||
    pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL}`

  const tabsItems = [
    {
      icon: <Icon name={IconEnum.SUCCESS} viewBox="0 0 16 16" className="w-4 mt-0.5" />,
      name: 'Environments',
      active: pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}/general`,
      link: `${ENVIRONMENTS_URL(organizationId, projectId)}/general`,
    },
    {
      icon: <Icon name="icon-solid-browser" className="text-sm text-inherit" />,
      name: 'Deployment Rules',
      active: isDeploymentRulesTab,
      link: `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`,
    },
    {
      icon: <Icon name="icon-solid-wheel" className="text-sm text-inherit" />,
      name: 'Settings',
      active: pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_SETTINGS_URL}`,
      link: `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_SETTINGS_URL}`,
    },
  ]

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <ButtonAction
        iconRight="icon-solid-plus"
        external
        link={`https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments`}
      >
        New environment
      </ButtonAction>
    </div>
  )

  return (
    <>
      <Header title="Environments" icon={IconEnum.ENVIRONMENT} buttons={headerButtons} />
      <Tabs items={tabsItems} contentRight={!isDeploymentRulesTab && contentTabs} />
      <div className="flex-grow flex-col flex">{children}</div>
    </>
  )
}

export default Container
