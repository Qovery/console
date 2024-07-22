import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect } from 'react'
import { useLifecycleTemplate } from '@qovery/domains/environments/feature'
import { type ServiceTemplateOptionType } from '../page-new-feature/service-templates'
import { useJobContainerCreateContext } from './page-job-create-feature'

function getLifycleType(option?: string): JobLifecycleTypeEnum {
  if (option?.includes('terraform')) {
    return 'TERRAFORM'
  }

  if (option?.includes('cloudformation')) {
    return 'CLOUDFORMATION'
  }

  return 'GENERIC'
}

interface TemplateFormContextSyncProps {
  environmentId: string
  templateData: ServiceTemplateOptionType & { template_id: string }
  children: ReactNode
}

export function TemplateFormContextSync({
  environmentId,
  templateData: { slug, template_id: templateId },
  children,
}: TemplateFormContextSyncProps) {
  const { data: template } = useLifecycleTemplate({ environmentId, templateId })
  const { setGeneralData, setConfigureData, setVariableData, setResourcesData } = useJobContainerCreateContext()

  useEffect(() => {
    if (template) {
      setGeneralData((generalData) =>
        generalData
          ? {
              ...generalData,
              name: slug,
              serviceType: slug === 'container' ? 'CONTAINER' : 'APPLICATION',
              template_type: getLifycleType(slug),
            }
          : undefined
      )
    }
  }, [template])

  return children
}

export default TemplateFormContextSync
