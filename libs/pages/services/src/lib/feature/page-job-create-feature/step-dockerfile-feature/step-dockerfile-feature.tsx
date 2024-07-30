import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCheckDockerfile } from '@qovery/domains/environments/feature'
import { DockerfileSettings } from '@qovery/domains/services/feature'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepDockerfileFeature() {
  useDocumentTitle('Dockerfile - Create Job')
  const { dockerfileForm, setCurrentStep, generalData, jobURL, dockerfileDefaultContent, templateType } =
    useJobContainerCreateContext()
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

  const watchDockerfilePath = dockerfileForm.watch('dockerfile_path')
  const watchDockerfileRaw = dockerfileForm.watch('dockerfile_raw')
  const watchDockerfileSource = dockerfileForm.watch('dockerfile_source')

  // HACK: Circonvent pitfall of formState.isValid issues, specially in test
  // https://github.com/react-hook-form/react-hook-form/issues/2755
  const isValid = watchDockerfileSource === 'DOCKERFILE_RAW' ? !!watchDockerfileRaw : !!watchDockerfilePath

  return (
    <FunnelFlowBody>
      <FormProvider {...dockerfileForm}>
        <Section className="items-start">
          <Heading className="mb-2">Dockerfile</Heading>
          <p className="mb-10 text-sm text-neutral-350">
            {match(templateType)
              .with(
                'CLOUDFORMATION',
                (templateType) =>
                  `The Dockerfile allows to package your template and input into a container image with the right ${upperCaseFirstLetter(templateType)} CLI, inputs and commands to run. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw).`
              )
              .with(
                'TERRAFORM',
                (templateType) =>
                  `The Dockerfile allows to package your manifest and input into a container image with the right ${upperCaseFirstLetter(templateType)} CLI, inputs and commands to run. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw).`
              )
              .with(
                'GENERIC',
                undefined,
                () =>
                  `The Dockerfile allows to package your application with the right CLIs/Libraries and as well define the command to run during its execution. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw).`
              )
              .exhaustive()}
          </p>
          <DockerfileSettings
            methods={dockerfileForm}
            onSubmit={onSubmit}
            defaultContent={dockerfileDefaultContent}
            templateType={templateType}
          >
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
                <Button type="submit" size="lg" disabled={!isValid} loading={isLoadingCheckDockerfile}>
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
