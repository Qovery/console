import { BuildModeEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCheckDockerfile } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_JOB_CREATION_CONFIGURE_URL, SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import StepGeneral from '../../../ui/page-job-create/step-general/step-general'
import { findTemplateData, useJobContainerCreateContext } from '../page-job-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Job')
  const { setGeneralData, generalData, setCurrentStep, jobURL, jobType } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useCheckDockerfile()

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const templateData = findTemplateData(slug, option)

  const methods = useForm<JobGeneralData>({
    defaultValues: {
      name: templateData ? templateData.slug : '',
      serviceType: templateData?.slug === 'container' ? 'CONTAINER' : 'APPLICATION',
      auto_deploy: true,
      ...generalData,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    methods.setValue('build_mode', BuildModeEnum.DOCKER)
  }, [methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    function onSubmitForm() {
      const cloneData = {
        ...data,
      }

      if (jobType === ServiceTypeEnum.CRON_JOB) {
        if (data.cmd_arguments) {
          try {
            cloneData.cmd = eval(data.cmd_arguments)
          } catch (e: unknown) {
            toastError(e as Error, 'Invalid CMD array')
            return
          }
        }
      }

      setGeneralData(cloneData)
      const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
      navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
    }

    if (data.serviceType !== ServiceTypeEnum.CONTAINER && data.build_mode === 'DOCKER') {
      try {
        await mutateCheckDockerfile({
          environmentId,
          dockerfileCheckRequest: {
            git_repository: {
              url: buildGitRepoUrl(data.provider ?? '', data.repository || ''),
              root_path: data.root_path,
              branch: data.branch,
              git_token_id: data.git_token_id,
            },
            dockerfile_path: data.dockerfile_path ?? '',
          },
        })
        onSubmitForm()
      } catch (e: unknown) {
        methods.setError('dockerfile_path', {
          type: 'custom',
          message: (e as Error).message ?? 'Dockerfile not found, please check the path and try again.',
        })
      }
    } else {
      onSubmitForm()
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepGeneral
          organization={organization}
          onSubmit={onSubmit}
          jobType={jobType}
          loadingCheckDockerfile={isLoadingCheckDockerfile}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
