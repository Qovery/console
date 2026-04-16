import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { StepGeneral, useJobCreateContext } from '@qovery/domains/service-job/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { parseCmd } from '@qovery/shared/util-js'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general'
)({
  component: RouteComponent,
})

export function LifecycleJobGeneral() {
  const { setGeneralData, generalData, dockerfileForm, setCurrentStep, jobURL, jobType, templateType } =
    useJobCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId, suspense: true })

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
      dockerfileForm.setValue('docker_target_build_stage', undefined)
    }
    setGeneralData(cloneData)

    if (data.serviceType === ServiceTypeEnum.APPLICATION && jobType !== 'CRON_JOB') {
      // navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/dockerfile',
        params: { organizationId, projectId, environmentId },
      })
    } else {
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/configure',
        params: { organizationId, projectId, environmentId },
      })
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

function RouteComponent() {
  useDocumentTitle('General - Create Lifecycle Job')

  return <LifecycleJobGeneral />
}
