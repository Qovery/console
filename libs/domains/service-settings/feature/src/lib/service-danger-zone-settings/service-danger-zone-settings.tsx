import { useParams } from '@tanstack/react-router'
import { useDeleteService, useService } from '@qovery/domains/services/feature'
import { BlockContentDelete } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export interface ServiceDangerZoneSettingsProps {
  onDeleteSuccess: () => void
}

export function ServiceDangerZoneSettings({ onDeleteSuccess }: ServiceDangerZoneSettingsProps) {
  const { organizationId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  useDocumentTitle('Danger zone - Service settings')

  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { mutateAsync: deleteService } = useDeleteService({ organizationId, environmentId })

  const mutationDeleteService = async () => {
    if (!service) {
      return
    }

    try {
      await deleteService({ serviceId, serviceType: service.serviceType })
      onDeleteSuccess()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left px-8 pb-8 pt-6">
        <BlockContentDelete
          title="Delete service"
          ctaLabel="Delete service"
          callback={mutationDeleteService}
          modalConfirmation={{
            title: 'Delete service',
            name: service?.name,
          }}
        />
      </div>
    </div>
  )
}

export default ServiceDangerZoneSettings
