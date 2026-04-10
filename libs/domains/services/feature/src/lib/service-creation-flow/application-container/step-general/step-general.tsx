import * as Collapsible from '@radix-ui/react-collapsible'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { type FormEventHandler, type PropsWithChildren, type ReactNode, useEffect, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { mutations as environmentMutations } from '@qovery/domains/environments/data-access'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Icon, InputSelect, Link, Section } from '@qovery/shared/ui'
import { parseCmd } from '@qovery/shared/util-js'
import { AutoDeploySetting } from '../../../auto-deploy-setting/auto-deploy-setting'
import { BuildSettings } from '../../../build-settings/build-settings'
import { GeneralSetting } from '../../../general-setting/general-setting'
import { useApplicationContainerCreateContext } from '../application-container-creation-flow'

export interface ApplicationContainerStepGeneralProps extends PropsWithChildren {
  gitRepositorySettings: ReactNode
  generalContainerSettings: ReactNode
  entrypointCmdInputs: ReactNode
  labelSetting: ReactNode
  annotationSetting: ReactNode
  onSubmit: (data: ApplicationGeneralData) => void
}

export function ApplicationContainerStepGeneral({
  onSubmit,
  gitRepositorySettings,
  generalContainerSettings,
  entrypointCmdInputs,
  labelSetting,
  annotationSetting,
}: ApplicationContainerStepGeneralProps) {
  const { generalForm, setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useMutation(
    environmentMutations.checkDockerfile,
    {
      meta: {
        notifyOnError: true,
      },
    }
  )
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = generalForm

  const watchServiceType = methods.watch('serviceType')
  const watchIsPublicRepository = methods.watch('is_public_repository')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? Boolean(methods.watch('branch')) : true

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit(async (data) => {
    const nextData = {
      ...data,
      auto_deploy: data.is_public_repository ? false : data.auto_deploy,
    }

    if (nextData.cmd_arguments) {
      nextData.cmd = parseCmd(nextData.cmd_arguments)
    }

    const submitForm = () => {
      methods.reset(nextData)
      onSubmit(nextData)
    }

    if (nextData.serviceType !== ServiceTypeEnum.CONTAINER) {
      try {
        await mutateCheckDockerfile({
          environmentId,
          dockerfileCheckRequest: {
            git_repository: {
              provider: nextData.provider ?? 'GITHUB',
              url: nextData.git_repository?.url ?? nextData.repository ?? '',
              root_path: nextData.root_path,
              branch: nextData.branch,
              git_token_id: nextData.git_token_id,
            },
            dockerfile_path: nextData.dockerfile_path ?? '',
          },
        })
        submitForm()
      } catch (error: unknown) {
        methods.setError('dockerfile_path', {
          type: 'custom',
          message: (error as Error).message ?? 'Dockerfile not found, please check the path and try again.',
        })
      }
    } else {
      submitForm()
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <Section>
          <Heading className="mb-2">General information</Heading>
          <p className="mb-10 text-sm text-neutral-subtle">
            These general settings allow you to set up the service name, its source and deployment parameters.
          </p>

          <form className="space-y-10" onSubmit={handleSubmit}>
            <Section className="gap-4">
              <Heading>General</Heading>
              <GeneralSetting
                label="Service name"
                service={{
                  id: '',
                  name: '',
                  environment: {
                    id: '',
                  },
                  service_type: 'APPLICATION',
                  serviceType: 'APPLICATION',
                  created_at: '',
                  healthchecks: {},
                  icon_uri: 'app://qovery-console/application',
                }}
              />
            </Section>

            <Section className="gap-4">
              <Heading>Source</Heading>
              <Controller
                name="serviceType"
                control={methods.control}
                rules={{
                  required: 'Please select a source.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    dataTestId="input-select-source"
                    onChange={field.onChange}
                    value={field.value}
                    options={[
                      {
                        value: ServiceTypeEnum.APPLICATION,
                        label: 'Git provider',
                        icon: <Icon iconName="code-branch" className="w-4" />,
                      },
                      {
                        value: ServiceTypeEnum.CONTAINER,
                        label: 'Container Registry',
                        icon: <Icon name={IconEnum.CONTAINER} className="w-4" />,
                      },
                    ]}
                    label="Application source"
                    error={error?.message}
                  />
                )}
              />

              {watchServiceType === 'APPLICATION' && gitRepositorySettings}
              {watchServiceType === 'CONTAINER' && generalContainerSettings}
            </Section>

            {watchServiceType && (
              <>
                <Section className="gap-4">
                  <Heading>{watchServiceType === 'APPLICATION' ? 'Build and deploy' : 'Deploy'}</Heading>
                  {watchServiceType === 'APPLICATION' && <BuildSettings />}

                  {entrypointCmdInputs}
                  {!watchIsPublicRepository && (
                    <AutoDeploySetting source={watchServiceType === 'CONTAINER' ? 'CONTAINER_REGISTRY' : 'GIT'} />
                  )}
                </Section>
                <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
                  <Section className="gap-4">
                    <div className="flex justify-between">
                      <Heading>Extra labels/annotations</Heading>
                      <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium">
                        {openExtraAttributes ? (
                          <>
                            Hide <Icon iconName="chevron-up" />
                          </>
                        ) : (
                          <>
                            Show <Icon iconName="chevron-down" />
                          </>
                        )}
                      </Collapsible.Trigger>
                    </div>
                    <Collapsible.Content className="flex flex-col gap-4">
                      {labelSetting}
                      {annotationSetting}
                    </Collapsible.Content>
                  </Section>
                </Collapsible.Root>
              </>
            )}

            <div className="flex justify-between">
              <Link
                as="button"
                size="lg"
                type="button"
                variant="plain"
                color="neutral"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{
                  organizationId,
                  projectId,
                  environmentId,
                }}
              >
                Cancel
              </Link>
              <Button
                data-testid="button-submit"
                type="submit"
                disabled={!(methods.formState.isValid && isGitSettingsValid)}
                size="lg"
                loading={isLoadingCheckDockerfile}
              >
                Continue
              </Button>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepGeneral
