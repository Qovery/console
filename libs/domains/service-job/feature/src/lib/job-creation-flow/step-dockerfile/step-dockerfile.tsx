import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCheckDockerfile } from '@qovery/domains/environments/feature'
import { Button, FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { DockerfileSettings } from '../../dockerfile-settings/dockerfile-settings'
import { useJobCreateContext } from '../job-creation-flow'

export function StepDockerfile() {
  const { dockerfileForm, setCurrentStep, generalData, dockerfileDefaultContent, templateType, jobURL } =
    useJobCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate({
        to: jobURL + '/general',
        params: { organizationId, projectId, environmentId },
      })
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])

  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useCheckDockerfile()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = dockerfileForm.handleSubmit(async (data) => {
    const pathCreate = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/lifecycle-job/configure`
    if (data.dockerfile_raw) {
      navigate({
        to: pathCreate,
        params: { organizationId, projectId, environmentId },
      })
    } else if (data.dockerfile_path) {
      try {
        await mutateCheckDockerfile({
          environmentId,
          dockerfileCheckRequest: {
            git_repository: {
              provider: generalData?.provider ?? 'GITHUB',
              url: generalData?.git_repository?.url ?? generalData?.repository ?? '',
              root_path: generalData?.root_path,
              branch: generalData?.branch,
              git_token_id: generalData?.git_token_id,
            },
            dockerfile_path: data.dockerfile_path,
          },
        })
        navigate({
          to: pathCreate,
          params: { organizationId, projectId, environmentId },
        })
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
          <p className="mb-10 text-sm text-neutral-subtle">
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
                onClick={() =>
                  navigate({
                    to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general',
                    params: { organizationId, projectId, environmentId },
                  })
                }
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
