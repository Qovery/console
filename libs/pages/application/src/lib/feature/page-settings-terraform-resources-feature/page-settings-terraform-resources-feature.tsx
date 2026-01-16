import { type ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { TerraformResourcesSection } from '@qovery/domains/service-terraform/feature'
import { useService } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

export function PageSettingsTerraformResourcesFeature(): ReactElement {
  const { applicationId = '' } = useParams()
  const { data: service, isLoading } = useService({
    serviceId: applicationId,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderSpinner className="w-6" />
      </div>
    )
  }

  if (!service || service.serviceType !== 'TERRAFORM') {
    return <div />
  }

  return (
    <div className="flex w-full max-w-[1024px] flex-col gap-8 p-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-neutral-400">Terraform Resources</h1>
        <p className="text-sm text-neutral-350">View infrastructure resources created by {service.name}</p>
      </div>

      <TerraformResourcesSection terraformId={applicationId} />
    </div>
  )
}

export default PageSettingsTerraformResourcesFeature
