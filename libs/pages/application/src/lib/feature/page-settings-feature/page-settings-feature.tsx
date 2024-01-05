import { useCallback } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { isHelmGitSource } from '@qovery/shared/enums'
import {
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_CONFIGURE_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_HEALTHCHECKS_URL,
  APPLICATION_SETTINGS_NETWORKING_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
import { IconAwesomeEnum, type NavigationLeftLinkProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_APPLICATION_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  useDocumentTitle('Application - Settings')

  const pathSettings = `${APPLICATION_URL(
    organizationId,
    projectId,
    environmentId,
    applicationId
  )}${APPLICATION_SETTINGS_URL}`

  const { data: service } = useService({ serviceId: applicationId })

  const isHelm = service?.serviceType === 'HELM'

  const getLinks = useCallback(() => {
    const links: NavigationLeftLinkProps[] = [
      {
        title: 'General',
        icon: IconAwesomeEnum.WHEEL,
        url: pathSettings + APPLICATION_SETTINGS_GENERAL_URL,
      },
    ]

    if (isHelm) {
      links.push({
        title: 'Values',
        icon: IconAwesomeEnum.KEY,
        subLinks: [
          {
            title: 'Override as file',
            url: pathSettings + APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
          },
          {
            title: 'Override as arguments',
            url: pathSettings + APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
          },
        ],
      })
      links.push({
        title: 'Networking',
        icon: IconAwesomeEnum.PLUG,
        url: pathSettings + APPLICATION_SETTINGS_NETWORKING_URL,
      })
    }

    if (service?.serviceType === 'JOB') {
      links.push({
        title: 'Configure Job',
        icon: IconAwesomeEnum.GEARS,
        url: pathSettings + APPLICATION_SETTINGS_CONFIGURE_URL,
      })
    }

    if (!isHelm) {
      links.push({
        title: 'Resources',
        icon: IconAwesomeEnum.CHART_BULLET,
        url: pathSettings + APPLICATION_SETTINGS_RESOURCES_URL,
      })
    }

    if (service?.serviceType !== 'JOB' && !isHelm) {
      links.push(
        {
          title: 'Storage',
          icon: IconAwesomeEnum.HARD_DRIVE,
          url: pathSettings + APPLICATION_SETTINGS_STORAGE_URL,
        },
        {
          title: 'Domain',
          icon: IconAwesomeEnum.EARTH_AMERICAS,
          url: pathSettings + APPLICATION_SETTINGS_DOMAIN_URL,
        },
        {
          title: 'Port',
          icon: IconAwesomeEnum.PLUG,
          url: pathSettings + APPLICATION_SETTINGS_PORT_URL,
        },
        {
          title: 'Health Checks',
          icon: IconAwesomeEnum.SHIELD_CHECK,
          url: pathSettings + APPLICATION_SETTINGS_HEALTHCHECKS_URL,
        }
      )
    }

    if (
      service?.serviceType === 'APPLICATION' ||
      service?.serviceType === 'JOB' ||
      (isHelm && isHelmGitSource(service.source))
    ) {
      links.push({
        title: 'Deployment restrictions',
        icon: IconAwesomeEnum.CART_FLATBED,
        url: pathSettings + APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
      })
    }

    links.push({
      title: 'Advanced settings',
      icon: IconAwesomeEnum.GEARS,
      url: pathSettings + APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
    })

    links.push({
      title: 'Danger zone',
      icon: IconAwesomeEnum.SKULL,
      url: pathSettings + APPLICATION_SETTINGS_DANGER_ZONE_URL,
    })

    return links
  }, [service, isHelm, pathSettings])

  if (!service) return null

  return (
    <PageSettings links={getLinks()}>
      <Routes>
        {ROUTER_APPLICATION_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + APPLICATION_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
