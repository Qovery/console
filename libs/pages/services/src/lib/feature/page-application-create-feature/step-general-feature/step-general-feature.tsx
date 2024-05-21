import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_CREATION_RESOURCES_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepGeneral from '../../../ui/page-application-create/step-general/step-general'
import { findTemplateData } from '../../page-job-create-feature/page-job-create-feature'
import { serviceTemplates } from '../../page-new-feature/service-templates'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Application')
  const { setGeneralData, generalData, setCurrentStep, creationFlowUrl } = useApplicationContainerCreateContext()
  const { organizationId = '', slug, option } = useParams()
  const navigate = useNavigate()
  const { data: organization } = useOrganization({ organizationId })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  const methods = useForm<ApplicationGeneralData>({
    defaultValues: {
      auto_deploy: true,
      name: dataTemplate?.slug ?? '',
      serviceType: (dataOptionTemplate?.type as ServiceTypeEnum) ?? (dataTemplate?.type as ServiceTypeEnum),
      ...generalData,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData = {
      ...data,
    }

    if (data.cmd_arguments) {
      try {
        cloneData.cmd = eval(data.cmd_arguments)
      } catch (e: unknown) {
        toastError(e as Error, 'Invalid CMD array')
        return
      }
    }
    setGeneralData(cloneData)
    navigate(creationFlowUrl + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepGeneral organization={organization} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
