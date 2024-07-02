import { JobLifecycleTypeEnum } from 'qovery-typescript-axios'
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
import { findTemplateData, useJobContainerCreateContext } from '../page-job-create-feature'

function getLifycleType(option?: string): JobLifecycleTypeEnum {
  if (option?.includes('terraform')) {
    return 'TERRAFORM'
  }

  if (option?.includes('cloudformation')) {
    return 'CLOUDFORMATION'
  }

  return 'GENERIC'
}

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Job')
  const { setGeneralData, generalData, dockerfileForm, setCurrentStep, jobURL, jobType } =
    useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const templateData = findTemplateData(slug, option)

  const methods = useForm<JobGeneralData>({
    defaultValues: {
      name: templateData ? templateData.slug : '',
      serviceType: templateData?.slug === 'container' ? 'CONTAINER' : 'APPLICATION',
      auto_deploy: true,
      lifecycle_type: getLifycleType(option),
      ...generalData,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const cloneData = {
      ...data,
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
    if (data.serviceType === ServiceTypeEnum.APPLICATION) {
      navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
    } else {
      navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepGeneral organization={organization} onSubmit={onSubmit} jobType={jobType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
