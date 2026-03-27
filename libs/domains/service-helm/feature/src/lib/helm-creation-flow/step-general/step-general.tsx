import * as Collapsible from '@radix-ui/react-collapsible'
import { useNavigate, useParams } from '@tanstack/react-router'
import { type FormEventHandler, type ReactNode, useEffect, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { AutoDeploySetting, GeneralSetting, type HelmGeneralData } from '@qovery/domains/services/feature'
import { Button, Callout, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import { DeploymentSetting } from '../../deployment-setting/deployment-setting'
import { SourceSetting } from '../../source-setting/source-setting'
import { useHelmCreateContext } from '../helm-creation-flow'

export interface HelmStepGeneralProps {
  labelSetting: ReactNode
  annotationSetting: ReactNode
  onSubmit: (data: HelmGeneralData) => void
}

export function HelmStepGeneral({ onSubmit, labelSetting, annotationSetting }: HelmStepGeneralProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { generalForm, setCurrentStep } = useHelmCreateContext()
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = generalForm

  const watchSourceProvider = methods.watch('source_provider')
  const watchGitProvider = methods.watch('provider')
  const watchGitTokenId = methods.watch('git_token_id')
  const watchGitRepository = methods.watch('git_repository')
  const watchIsPublicRepository = methods.watch('is_public_repository')

  const isGitSettingsValid = watchSourceProvider === 'GIT' ? Boolean(methods.watch('branch')) : true

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((data) => {
    const nextData = {
      ...data,
      auto_deploy: data.is_public_repository ? false : data.auto_deploy,
    }

    methods.reset(nextData)
    onSubmit(nextData)
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
                  service_type: 'HELM',
                  serviceType: 'HELM',
                  id: '',
                  name: '',
                  created_at: '',
                  environment: {
                    id: '',
                  },
                  auto_deploy: false,
                  auto_preview: false,
                  source: {
                    repository: {
                      chart_name: '',
                      chart_version: '',
                      repository: {
                        id: '',
                        name: '',
                        url: '',
                      },
                    },
                  },
                  arguments: [],
                  icon_uri: 'app://qovery-console/helm',
                  allow_cluster_wide_resources: false,
                  values_override: {},
                }}
              />
            </Section>

            <Section className="gap-4">
              <Heading>Source</Heading>
              <SourceSetting />

              {watchSourceProvider === 'GIT' && (
                <div className="flex flex-col gap-3">
                  <GitProviderSetting organizationId={organizationId} />
                  {watchIsPublicRepository ? (
                    <>
                      <GitPublicRepositorySettings />
                      <Callout.Root color="sky" className="items-center">
                        <Callout.Icon>
                          <Icon iconName="info-circle" iconStyle="regular" />
                        </Callout.Icon>
                        <Callout.Text>
                          Git automations are disabled when using public repos (auto-deploy, automatic preview
                          environments)
                        </Callout.Text>
                      </Callout.Root>
                    </>
                  ) : (
                    <>
                      {watchGitProvider && (
                        <GitRepositorySetting
                          organizationId={organizationId}
                          gitProvider={watchGitProvider}
                          gitTokenId={watchGitTokenId}
                        />
                      )}
                      {watchGitProvider && watchGitRepository && (
                        <GitBranchSettings
                          organizationId={organizationId}
                          gitProvider={watchGitProvider}
                          gitTokenId={watchGitTokenId}
                          rootPathLabel="Chart root folder path"
                          rootPathHint="Provide the folder path in the repository where the chart is located."
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </Section>

            {watchSourceProvider && (
              <>
                <Section className="gap-4">
                  <Heading>Deploy</Heading>
                  <DeploymentSetting />
                  {watchSourceProvider === 'GIT' && !watchIsPublicRepository && <AutoDeploySetting source="GIT" />}
                  {watchSourceProvider === 'HELM_REPOSITORY' && (
                    <Callout.Root color="sky" className="items-center">
                      <Callout.Icon>
                        <Icon iconName="circle-info" iconStyle="regular" />
                      </Callout.Icon>
                      <Callout.Text>
                        <Callout.TextHeading>
                          Git automations are disabled when using Helm repositories (auto-deploy, automatic preview
                          environments)
                        </Callout.TextHeading>
                      </Callout.Text>
                    </Callout.Root>
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
              <Button
                type="button"
                size="lg"
                variant="plain"
                color="neutral"
                onClick={() =>
                  navigate({
                    to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
                    params: {
                      organizationId,
                      projectId,
                      environmentId,
                    },
                  })
                }
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={!(methods.formState.isValid && isGitSettingsValid)}>
                Continue
              </Button>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}
