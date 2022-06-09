import { useLocation, useParams } from 'react-router'
import {
  ENVIRONMENTS_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE,
} from '@console/shared/utils'
import { ButtonIcon, ButtonIconStyle, Header, ButtonAction, Icon, Tabs } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'

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
        location.pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}` ||
        location.pathname ===
          `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE}`,
      link: `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}`,
    },
  ]

  const isDeploymentRulesTab =
    location.pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}` ||
    location.pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE}`

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      {!isDeploymentRulesTab && <ButtonAction iconRight="icon-solid-plus">New environment</ButtonAction>}
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
