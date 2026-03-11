import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { isHelmGitSource, isJobGitSource } from '@qovery/shared/enums'
import {
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_CONFIGURE_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
  APPLICATION_SETTINGS_DOCKERFILE_URL,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_HEALTHCHECKS_URL,
  APPLICATION_SETTINGS_NETWORKING_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_TERRAFORM_ARGUMENTS_URL,
  APPLICATION_SETTINGS_TERRAFORM_CONFIGURATION_URL,
  APPLICATION_SETTINGS_TERRAFORM_VARIABLES_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary, IconAwesomeEnum, type NavigationLeftLinkProps } from '@qovery/shared/ui'
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

  const dockerfileSetting = {
    title: 'Dockerfile',
    iconName: 'box' as const,
    url: pathSettings + APPLICATION_SETTINGS_DOCKERFILE_URL,
  }

  const configureJobSetting = {
    title: match(service)
      .with({ service_type: 'JOB', job_type: 'CRON' }, () => 'Job configuration')
      .with({ service_type: 'JOB', job_type: 'LIFECYCLE' }, () => 'Triggers')
      .otherwise(() => ''),
    icon: IconAwesomeEnum.GEARS,
    url: pathSettings + APPLICATION_SETTINGS_CONFIGURE_URL,
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

  const terraformConfigurationSetting = {
    title: 'Terraform configuration',
    iconName: 'sliders' as const,
    url: pathSettings + APPLICATION_SETTINGS_TERRAFORM_CONFIGURATION_URL,
  }

  const terraformArgumentsSetting = {
    title: 'Terraform arguments',
    iconName: 'play-circle' as const,
    iconStyle: 'regular' as const,
    url: pathSettings + APPLICATION_SETTINGS_TERRAFORM_ARGUMENTS_URL,
  }

  const terraformVariablesSetting = {
    title: 'Terraform variables',
    iconName: 'key' as const,
    url: pathSettings + APPLICATION_SETTINGS_TERRAFORM_VARIABLES_URL,
  }

  const links = match(service)
    .returnType<NavigationLeftLinkProps[]>()
    .with({ serviceType: 'APPLICATION' }, () => [
      storageSettings,
      domainSettings,
      healthchecksSettings,
      deploymentRestrictionsSettings,
      advancedSettings,
      dangerzoneSettings,
    ])
    .with({ serviceType: 'CONTAINER' }, () => [
      storageSettings,
      domainSettings,
      healthchecksSettings,
      advancedSettings,
      dangerzoneSettings,
    ])
    .with({ serviceType: 'HELM' }, (s) => [
      valuesOverrideSetting,
      networkingSetting,
      domainSettings,
      ...(isHelmGitSource(s.source) ? [deploymentRestrictionsSettings] : []),
      advancedSettings,
      dangerzoneSettings,
    ])
    .with({ serviceType: 'TERRAFORM' }, () => [
      terraformConfigurationSetting,
      terraformVariablesSetting,
      terraformArgumentsSetting,
      deploymentRestrictionsSettings,
      advancedSettings,
      dangerzoneSettings,
    ])
    .with({ serviceType: 'JOB' }, (s) => [
      ...(s.job_type === 'LIFECYCLE' && isJobGitSource(s.source) ? [dockerfileSetting] : []),
      configureJobSetting,
      deploymentRestrictionsSettings,
      advancedSettings,
      dangerzoneSettings,
    ])
    .otherwise(() => [])
  const defaultSettingsUrl = links[0]?.url ?? pathSettings + APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL

  if (!service) return null

  return (
    <PageSettings links={links}>
      <Routes>
        {ROUTER_APPLICATION_SETTINGS.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
          />
        ))}
        <Route path="*" element={<Navigate replace to={defaultSettingsUrl} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
