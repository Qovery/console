import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_DOCKERFILE_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { parseCmd } from '@qovery/shared/util-js'
import StepGeneral from '../../../ui/page-job-create/step-general/step-general'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Job')
  const { setGeneralData, generalData, dockerfileForm, setCurrentStep, jobURL, jobType, templateType } =
    useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<JobGeneralData>({
    defaultValues: {
      auto_deploy: true,
      template_type: templateType,
      ...generalData,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const cloneData = {
      ...data,
    }

    if (data.is_public_repository) {
      data.auto_deploy = false
    }

    if (data.cmd_arguments) {
      cloneData.cmd = parseCmd(data.cmd_arguments)
    }

    if (data.serviceType === 'CONTAINER') {
      dockerfileForm.setValue('dockerfile_path', undefined)
      dockerfileForm.setValue('dockerfile_raw', undefined)
    }
    setGeneralData(cloneData)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`

    if (data.serviceType === ServiceTypeEnum.APPLICATION && jobType !== 'CRON_JOB') {
      navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
    } else {
      navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepGeneral organization={organization} onSubmit={onSubmit} jobType={jobType} templateType={templateType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
