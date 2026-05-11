import { useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { DatabaseResourcesSettings } from './database-resources-settings/database-resources-settings'
import { ServiceResourcesSettings as NonDatabaseServiceResourcesSettings } from './service-resources-settings/service-resources-settings'

const ResourcesSettingsFallback = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

export function ServiceResourcesSettings() {
  return (
    <Suspense fallback={<ResourcesSettingsFallback />}>
      <ServiceResourcesSettingsContent />
    </Suspense>
  )
}

function ServiceResourcesSettingsContent() {
  useDocumentTitle('Resources - Service settings')
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!service) {
    return null
  }

  return match(service)
    .with(
      { serviceType: 'APPLICATION' },
      { serviceType: 'CONTAINER' },
      { serviceType: 'JOB' },
      { serviceType: 'TERRAFORM' },
      (resourceService) => <NonDatabaseServiceResourcesSettings service={resourceService} />
    )
    .with({ serviceType: 'DATABASE' }, (database) => <DatabaseResourcesSettings database={database} />)
    .otherwise(() => null)
}

export default ServiceResourcesSettings
