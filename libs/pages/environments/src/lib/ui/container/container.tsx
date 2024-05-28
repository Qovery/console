import { type PropsWithChildren } from 'react'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { CreateCloneEnvironmentModal } from '@qovery/domains/environments/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { ShowAllVariablesToggle, VariablesActionToolbar, VariablesProvider } from '@qovery/domains/variables/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_URL,
  ENVIRONMENTS_VARIABLES_URL,
} from '@qovery/shared/routes'
import { Button, Header, Icon, Section, Tabs, toast, useModal } from '@qovery/shared/ui'

export function Container({ children }: PropsWithChildren) {
  const { organizationId = '', projectId = '' } = useParams()
  const { data: project } = useProject({ organizationId, projectId })
  const { data: clusters = [] } = useClusters({ organizationId })
  const { pathname } = useLocation()
  const { openModal, closeModal } = useModal()

  const isDeploymentRulesTab =
    pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}` ||
    pathname === `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL}`

  const clusterAvailable = clusters.length > 0

  const tabsItems = [
    {
      icon: <Icon iconName="layer-group" />,
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
      icon: <Icon name="icon-solid-key" />,
      name: 'Variables',
      active: pathname === ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_VARIABLES_URL,
      link: ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_VARIABLES_URL,
    },
  ]

  const matchEnvVariableRoute = matchPath(
    pathname || '',
    ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_VARIABLES_URL
  )

  const contentTabs = (
    <div className="flex h-14 items-center justify-center px-5">
      {matchEnvVariableRoute ? (
        <>
          <ShowAllVariablesToggle className="mr-2" />
          <VariablesActionToolbar
            scope="PROJECT"
            projectId={projectId}
            onCreateVariable={() => toast('SUCCESS', 'Creation success')}
          />
        </>
      ) : (
        <Button
          size="lg"
          className="gap-2"
          disabled={!clusterAvailable}
          onClick={() => {
            openModal({
              content: (
                <CreateCloneEnvironmentModal
                  onClose={closeModal}
                  projectId={projectId}
                  organizationId={organizationId}
                />
              ),
            })
          }}
        >
          New environment
          <Icon iconName="circle-plus" className="text-xs" />
        </Button>
      )}
    </div>
  )

  return (
    <VariablesProvider>
      <Section className="flex-1">
        <Header title={project?.name} icon={IconEnum.ENVIRONMENT} iconClassName="w-16" />
        <Tabs items={tabsItems} contentRight={!isDeploymentRulesTab && contentTabs} />
        <div className="flex flex-grow flex-col">{children}</div>
      </Section>
    </VariablesProvider>
  )
}

export default Container
