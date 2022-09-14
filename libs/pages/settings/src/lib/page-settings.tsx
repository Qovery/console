import { useSelector } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { selectProjectsEntitiesByOrgId } from '@qovery/domains/projects'
import {
  SETTINGS_BILLING_URL,
  SETTINGS_CLUSTER_URL,
  SETTINGS_DANGER_ZONE_URL,
  SETTINGS_GENERAL_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_URL,
} from '@qovery/shared/router'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { RootState } from '@qovery/store/data'
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
      ],
    },
    {
      title: 'Biling & plans',
      icon: IconAwesomeEnum.CREDIT_CARD,
      url: pathSettings + SETTINGS_BILLING_URL,
    },
    {
      title: 'Cluster',
      icon: IconAwesomeEnum.CLOUD,
      url: pathSettings + SETTINGS_CLUSTER_URL,
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
        onClick: () =>
          window.open(
            `https://console.qovery.com/platform/organization/${organizationId}/projects/${project.id}/environments`
          ),
      },
      {
        title: 'Danger zone',
        onClick: () =>
          window.open(
            `https://console.qovery.com/platform/organization/${organizationId}/projects/${project.id}/environments`
          ),
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
