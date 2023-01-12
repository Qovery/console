import { Project } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router-dom'
import { CreateCloneEnvironmentModalFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import {
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_URL,
} from '@qovery/shared/routes'
import {
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  Header,
  Icon,
  IconAwesomeEnum,
  Tabs,
  useModal,
} from '@qovery/shared/ui'

export interface ContainerProps {
  children: React.ReactNode
  project?: Project
  clusterAvailable?: boolean
}

export function Container(props: ContainerProps) {
  const { children, project, clusterAvailable } = props
  const { organizationId = '', projectId = '' } = useParams()
  const { pathname } = useLocation()
  const { openModal, closeModal } = useModal()

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
  ]

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <Button
        size={ButtonSize.LARGE}
        iconRight={IconAwesomeEnum.CIRCLE_PLUS}
        disabled={!clusterAvailable}
        onClick={() => {
          openModal({
            content: (
              <CreateCloneEnvironmentModalFeature
                onClose={closeModal}
                projectId={projectId}
                organizationId={organizationId}
              />
            ),
          })
        }}
      >
        New environment
      </Button>
    </div>
  )

  return (
    <>
      <Header title={project?.name} icon={IconEnum.ENVIRONMENT} buttons={headerButtons} />
      <Tabs items={tabsItems} contentRight={!isDeploymentRulesTab && contentTabs} />
      <div className="flex-grow flex-col flex">{children}</div>
    </>
  )
}

export default Container
