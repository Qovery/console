import { useSelector } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { selectProjectsEntitiesByOrgId } from '@qovery/domains/projects'
import {
  SETTINGS_BILLING_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_DANGER_ZONE_URL,
  SETTINGS_GENERAL_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_PROJECT_DANGER_ZONE_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_ROLES_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'
import { ROUTER_SETTINGS } from './router/router'
import { Container } from './ui/container/container'

export function PageSettings() {
  const { organizationId = '' } = useParams()

  const pathSettings = SETTINGS_URL(organizationId)
  const projects = useSelector((state: RootState) => selectProjectsEntitiesByOrgId(state, organizationId))

  const organizationLinks = [
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
      title: 'Biling & plans',
      icon: IconAwesomeEnum.CREDIT_CARD,
      url: pathSettings + SETTINGS_BILLING_URL,
    },
    {
      title: 'Container registries',
      icon: IconAwesomeEnum.BOX,
      url: pathSettings + SETTINGS_CONTAINER_REGISTRIES_URL,
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

  const accountLinks = [
    {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      onClick: () => window.open('https://console.qovery.com/platform/organization/user/settings/general'),
    },
    {
      title: 'Git permission',
      icon: IconAwesomeEnum.CODE_BRANCH,
      onClick: () =>
        window.open(`https://console.qovery.com/platform/organization/${organizationId}/settings/git-permission`),
    },
  ]

  return (
    <Container organizationLinks={organizationLinks} projectLinks={projectLinks} accountLinks={accountLinks}>
      <Routes>
        {ROUTER_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + SETTINGS_GENERAL_URL} />} />
      </Routes>
    </Container>
  )
}

export default PageSettings
