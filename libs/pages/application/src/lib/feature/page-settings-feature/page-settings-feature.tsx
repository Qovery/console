import { useCallback } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
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
import { IconAwesomeEnum } from '@qovery/shared/ui'
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

  const getLinks = useCallback(() => {
    const generalSettings = {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      url: pathSettings + APPLICATION_SETTINGS_GENERAL_URL,
    }

    const valuesOverrideSetting = {
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
    }

    const networkingSetting = {
      title: 'Networking',
      icon: IconAwesomeEnum.PLUG,
      url: pathSettings + APPLICATION_SETTINGS_NETWORKING_URL,
    }

    const configureJobSetting = {
      title: 'Configure Job',
      icon: IconAwesomeEnum.GEARS,
      url: pathSettings + APPLICATION_SETTINGS_CONFIGURE_URL,
    }

    const resourcesSettings = {
      title: 'Resources',
      icon: IconAwesomeEnum.CHART_BULLET,
      url: pathSettings + APPLICATION_SETTINGS_RESOURCES_URL,
    }

    const storageSettings = {
      title: 'Storage',
      icon: IconAwesomeEnum.HARD_DRIVE,
      url: pathSettings + APPLICATION_SETTINGS_STORAGE_URL,
    }

    const domainSettings = {
      title: 'Domain',
      icon: IconAwesomeEnum.EARTH_AMERICAS,
      url: pathSettings + APPLICATION_SETTINGS_DOMAIN_URL,
    }

    const portSettings = {
      title: 'Port',
      icon: IconAwesomeEnum.PLUG,
      url: pathSettings + APPLICATION_SETTINGS_PORT_URL,
    }

    const healthchecksSettings = {
      title: 'Health Checks',
      icon: IconAwesomeEnum.SHIELD_CHECK,
      url: pathSettings + APPLICATION_SETTINGS_HEALTHCHECKS_URL,
    }

    const deploymentRestrictionsSettings = {
      title: 'Deployment restrictions',
      icon: IconAwesomeEnum.CART_FLATBED,
      url: pathSettings + APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
    }

    const advancedSettings = {
      title: 'Advanced settings',
      icon: IconAwesomeEnum.GEARS,
      url: pathSettings + APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
    }

    const dangerzoneSettings = {
      title: 'Danger zone',
      icon: IconAwesomeEnum.SKULL,
      url: pathSettings + APPLICATION_SETTINGS_DANGER_ZONE_URL,
    }

    return match(service)
      .with({ serviceType: 'APPLICATION' }, () => [
        generalSettings,
        resourcesSettings,
        storageSettings,
        domainSettings,
        portSettings,
        healthchecksSettings,
        deploymentRestrictionsSettings,
        advancedSettings,
        dangerzoneSettings,
      ])
      .with({ serviceType: 'CONTAINER' }, () => [
        generalSettings,
        resourcesSettings,
        storageSettings,
        domainSettings,
        portSettings,
        healthchecksSettings,
        advancedSettings,
        dangerzoneSettings,
      ])
      .with({ serviceType: 'HELM' }, (s) => [
        generalSettings,
        valuesOverrideSetting,
        networkingSetting,
        domainSettings,
        ...(isHelmGitSource(s.source) ? [deploymentRestrictionsSettings] : []),
        advancedSettings,
        dangerzoneSettings,
      ])
      .with({ serviceType: 'JOB' }, () => [
        generalSettings,
        configureJobSetting,
        resourcesSettings,
        deploymentRestrictionsSettings,
        advancedSettings,
        dangerzoneSettings,
      ])
      .otherwise(() => [])
  }, [service, pathSettings])

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
