import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { GeneralSetting } from '@qovery/domains/services/feature'
import { Button, Callout, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import SourceSetting from '../../../source-setting/source-setting'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'

export const StepGeneral = () => {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { generalForm, setCurrentStep } = useTerraformCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const onSubmit = generalForm.handleSubmit((data) => {
    if (data.is_public_repository) {
      data.auto_deploy = false
    }

    navigate({ to: '../terraform-configuration' })
  })

  const watchFieldProvider = generalForm.watch('source_provider')
  const watchFieldGitProvider = generalForm.watch('provider')
  const watchFieldGitTokenId = generalForm.watch('git_token_id')
  const watchFieldGitRepository = generalForm.watch('repository')
  const watchFieldIsPublicRepository = generalForm.watch('is_public_repository')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchFieldProvider === 'GIT' ? generalForm.watch('branch') : true

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <Section>
        <>
          <Heading className="mb-2">General information</Heading>
          <p className="mb-10 text-sm text-neutral-subtle">
            These general settings allow you to set up the service name, its source and deployment parameters.
          </p>
        </>
        <form className="space-y-10" onSubmit={onSubmit}>
          <Section className="gap-4">
            <Heading>General</Heading>
            <GeneralSetting
              label="Service name"
              service={{
                service_type: 'TERRAFORM',
                serviceType: 'TERRAFORM',
                id: '',
                name: '',
                created_at: '',
                environment: {
                  id: environmentId,
                },
                auto_deploy: false,
                icon_uri: 'app://qovery-console/terraform',
                timeout_sec: 60,
                backend: {
                  kubernetes: {},
                },
                terraform_variables_source: {
                  tf_var_file_paths: [],
                  tf_vars: [],
                },
                engine: 'TERRAFORM',
                provider_version: {
                  read_from_terraform_block: false,
                  explicit_version: '1.13',
                },
                job_resources: {
                  cpu_milli: 500,
                  ram_mib: 256,
                  storage_gib: 5,
                  gpu: 0,
                },
                use_cluster_credentials: true,
                action_extra_arguments: {},
              }}
            />
          </Section>
          <Section className="gap-4">
            <Heading>Source</Heading>
            <SourceSetting />
            {watchFieldProvider === 'GIT' && (
              <div className="flex flex-col gap-3">
                <GitProviderSetting organizationId={organizationId} />
                {watchFieldIsPublicRepository ? (
                  <>
                    <GitPublicRepositorySettings
                      rootPathLabel="Manifest folder path"
                      rootPathHint="Provide the folder path in the repository where the manifest  is located."
                    />
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
                    {watchFieldGitProvider && (
                      <GitRepositorySetting
                        organizationId={organizationId}
                        gitProvider={watchFieldGitProvider}
                        gitTokenId={watchFieldGitTokenId}
                      />
                    )}
                    {watchFieldGitProvider && watchFieldGitRepository && (
                      <GitBranchSettings
                        organizationId={organizationId}
                        gitProvider={watchFieldGitProvider}
                        gitTokenId={watchFieldGitTokenId}
                        rootPathLabel="Terraform root folder path"
                        rootPathHint="Provide the folder path where the Terraform code is located in the repository."
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </Section>
          <div className="flex justify-between">
            <Button
              type="button"
              size="lg"
              color="neutral"
              variant="plain"
              onClick={() =>
                navigate({
                  to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
                  params: { organizationId, projectId, environmentId },
                })
              }
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={!(generalForm.formState.isValid && isGitSettingsValid)}>
              Continue
            </Button>
          </div>
        </form>
      </Section>
    </FunnelFlowBody>
  )
}
