import { type Project } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { CreateCloneEnvironmentModalFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import {
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_URL,
} from '@qovery/shared/routes'
import { ButtonLegacy, ButtonSize, Header, Icon, IconAwesomeEnum, Section, Tabs, useModal } from '@qovery/shared/ui'

export interface ContainerProps {
  project?: Project
  clusterAvailable?: boolean
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { children, project, clusterAvailable } = props
  const { organizationId = '', projectId = '' } = useParams()
  const { pathname } = useLocation()
  const { openModal, closeModal } = useModal()

  const isDeploymentRulesTab =
    pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}` ||
    pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL}`

  const tabsItems = [
    {
      icon: <Icon name={IconAwesomeEnum.LAYER_GROUP} />,
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
    <div className="flex justify-center items-center px-5 border-l h-14 border-neutral-200">
      <ButtonLegacy
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
      </ButtonLegacy>
    </div>
  )

  return (
    <Section>
      <Header title={project?.name} icon={IconEnum.ENVIRONMENT} iconClassName="w-16" />
      <Tabs items={tabsItems} contentRight={!isDeploymentRulesTab && contentTabs} />
      <div className="flex-grow flex-col flex">{children}</div>
    </Section>
  )
}

export default Container
