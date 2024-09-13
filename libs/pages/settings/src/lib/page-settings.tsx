import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useProjects } from '@qovery/domains/projects/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  SETTINGS_API_URL,
  SETTINGS_BILLING_SUMMARY_URL,
  SETTINGS_BILLING_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_DANGER_ZONE_URL,
  SETTINGS_GENERAL_URL,
  SETTINGS_GIT_REPOSITORY_ACCESS_URL,
  SETTINGS_HELM_REPOSITORIES_URL,
  SETTINGS_LABELS_ANNOTATIONS_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_PROJECT_DANGER_ZONE_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_ROLES_URL,
  SETTINGS_URL,
  SETTINGS_WEBHOOKS,
} from '@qovery/shared/routes'
import { ErrorBoundary, IconAwesomeEnum, type NavigationLeftLinkProps } from '@qovery/shared/ui'
import { ROUTER_SETTINGS } from './router/router'
import { Container } from './ui/container/container'

export function PageSettings() {
  const { organizationId = '' } = useParams()

  const pathSettings = SETTINGS_URL(organizationId)
  const { data: projects = [] } = useProjects({ organizationId })

  const organizationLinks: NavigationLeftLinkProps[] = [
    {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      url: pathSettings + SETTINGS_GENERAL_URL,
    },
    {
      title: 'Team',
      icon: IconAwesomeEnum.USER_GROUP,
      subLinks: [
        {
          title: 'Members',
          url: pathSettings + SETTINGS_MEMBERS_URL,
        },
        {
          title: 'Roles & permissions',
          url: pathSettings + SETTINGS_ROLES_URL,
        },
      ],
    },
    {
      title: 'Billing & plans',
      icon: IconAwesomeEnum.CREDIT_CARD,
      subLinks: [
        {
          title: 'Summary',
          url: pathSettings + SETTINGS_BILLING_SUMMARY_URL,
        },
        {
          title: 'Billing details',
          url: pathSettings + SETTINGS_BILLING_URL,
        },
      ],
    },
    {
      title: 'Labels & annotations',
      iconName: 'tags',
      url: pathSettings + SETTINGS_LABELS_ANNOTATIONS_URL,
    },
    {
      title: 'Container registries',
      icon: IconAwesomeEnum.BOX,
      url: pathSettings + SETTINGS_CONTAINER_REGISTRIES_URL,
    },
    {
      title: 'Helm repositories',
      icon: IconEnum.HELM_OFFICIAL,
      url: pathSettings + SETTINGS_HELM_REPOSITORIES_URL,
    },
    {
      title: 'Git repositories access',
      icon: IconAwesomeEnum.KEY,
      url: pathSettings + SETTINGS_GIT_REPOSITORY_ACCESS_URL,
    },
    {
      title: 'Webhook',
      icon: IconAwesomeEnum.TOWER_BROADCAST,
      url: pathSettings + SETTINGS_WEBHOOKS,
    },
    {
      title: 'API Token',
      icon: IconAwesomeEnum.CLOUD_ARROW_UP,
      url: pathSettings + SETTINGS_API_URL,
    },
    {
      title: 'Danger zone',
      icon: IconAwesomeEnum.SKULL,
      url: pathSettings + SETTINGS_DANGER_ZONE_URL,
    },
  ]

  const projectLinks = projects.map((project) => ({
    title: project.name,
    subLinks: [
      {
        title: 'General',
        url: pathSettings + SETTINGS_PROJECT_URL(project.id) + SETTINGS_PROJECT_GENERAL_URL,
      },
      {
        title: 'Danger zone',
        url: pathSettings + SETTINGS_PROJECT_URL(project.id) + SETTINGS_PROJECT_DANGER_ZONE_URL,
      },
    ],
  }))

  return (
    <Container organizationLinks={organizationLinks} projectLinks={projectLinks}>
      <Routes>
        {ROUTER_SETTINGS.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
          />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + SETTINGS_GENERAL_URL} />} />
      </Routes>
    </Container>
  )
}

export default PageSettings
