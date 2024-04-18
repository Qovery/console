import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_RESOURCES_URL, SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepGeneral from '../../../ui/page-application-create/step-general/step-general'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Application')
  const { setGeneralData, generalData, setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const { data: organization } = useOrganization({ organizationId })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<ApplicationGeneralData>({
    defaultValues: { auto_deploy: true, ...generalData },
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
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
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
