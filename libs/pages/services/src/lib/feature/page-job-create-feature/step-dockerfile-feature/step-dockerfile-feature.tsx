import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCheckDockerfile } from '@qovery/domains/environments/feature'
import { DockerfileSettings } from '@qovery/domains/services/feature'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepDockerfileFeature() {
  useDocumentTitle('Dockerfile - Create Job')
  const { dockerfileForm, setCurrentStep, generalData, jobURL } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const creationFlowUrl = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])
  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useCheckDockerfile()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = dockerfileForm.handleSubmit(async (data) => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    if (data.dockerfile_raw) {
      navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
    } else if (data.dockerfile_path) {
      try {
        await mutateCheckDockerfile({
          environmentId,
          dockerfileCheckRequest: {
            git_repository: {
              url: buildGitRepoUrl(generalData?.provider ?? '', generalData?.repository || ''),
              root_path: generalData?.root_path,
              branch: generalData?.branch,
              git_token_id: generalData?.git_token_id,
            },
            dockerfile_path: data.dockerfile_path,
          },
        })
        navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
      } catch (e: unknown) {
        dockerfileForm.setError('dockerfile_path', {
          type: 'custom',
          message: (e as Error).message ?? 'Dockerfile not found, please check the path and try again.',
        })
      }
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...dockerfileForm}>
        <Section className="items-start">
          <Heading className="mb-2">Dockerfile</Heading>
          <p className="mb-10 text-sm text-neutral-350">
            The Dockerfile allows to package your application with the right CLIs/Libraries and as well define the
            command to run during its execution. The Dockerfile can be stored in your git repository or on the Qovery
            control plane (Raw).
          </p>
          <DockerfileSettings methods={dockerfileForm} onSubmit={onSubmit}>
            <div className="flex justify-between">
              <Button
                type="button"
                size="lg"
                variant="plain"
                color="neutral"
                onClick={() => navigate(creationFlowUrl + SERVICES_JOB_CREATION_GENERAL_URL)}
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={isLoadingCheckDockerfile}>
                  Continue
                </Button>
              </div>
            </div>
          </DockerfileSettings>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepDockerfileFeature
