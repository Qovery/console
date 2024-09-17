import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCheckDockerfile } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_CREATION_RESOURCES_URL } from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl, parseCmd } from '@qovery/shared/util-js'
import StepGeneral from '../../../ui/page-application-create/step-general/step-general'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Application')
  const { setGeneralData, generalData, setCurrentStep, creationFlowUrl } = useApplicationContainerCreateContext()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()
  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useCheckDockerfile()
  const { data: organization } = useOrganization({ organizationId })
  const { environmentId = '' } = useParams()

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<ApplicationGeneralData>({
    defaultValues: {
      auto_deploy: true,
      ...generalData,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data.is_public_repository) {
      data.auto_deploy = false
    }

    function onSubmitForm() {
      const cloneData = {
        ...data,
      }

      if (data.cmd_arguments) {
        cloneData.cmd = parseCmd(data.cmd_arguments)
      }

      setGeneralData(cloneData)
      navigate(creationFlowUrl + SERVICES_CREATION_RESOURCES_URL)
    }

    if (data.serviceType !== ServiceTypeEnum.CONTAINER) {
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
          loadingCheckDockerfile={isLoadingCheckDockerfile}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
