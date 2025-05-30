import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { SourceSetting } from '@qovery/domains/service-terraform/feature'
import { AutoDeploySetting, GeneralSetting } from '@qovery/domains/services/feature'
import { SERVICES_TERRAFORM_CREATION_VALUES_STEP_1_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, Callout, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useTerraformCreateContext } from '../page-terraform-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Terraform')

  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const { generalForm, setCurrentStep, creationFlowUrl } = useTerraformCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const onSubmit = generalForm.handleSubmit((data) => {
    if (data.is_public_repository) {
      data.auto_deploy = false
    }

    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_VALUES_STEP_1_URL)
  })

  const watchFieldProvider = generalForm.watch('source_provider')
  const watchFieldGitProvider = generalForm.watch('provider')
  const watchFieldGitTokenId = generalForm.watch('git_token_id')
  const watchFieldGitRepository = generalForm.watch('repository')
  const watchFieldIsPublicRepository = generalForm.watch('is_public_repository')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchFieldProvider === 'GIT' ? generalForm.watch('branch') : true

  return (
    <FunnelFlowBody>
      <FormProvider {...generalForm}>
        <Section>
          <>
            <Heading className="mb-2">General information</Heading>
            <p className="mb-10 text-sm text-neutral-350">
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
                  // TODO [821] some keys do not exist in the API yet
                  // auto_preview: false,
                  // source: {
                  //   repository: {
                  //     chart_name: '',
                  //     chart_version: '',
                  //     repository: {
                  //       id: '',
                  //       name: '',
                  //       url: '',
                  //     },
                  //   },
                  // },
                  // arguments: [],
                  icon_uri: 'app://qovery-console/terraform',
                  // allow_cluster_wide_resources: false,
                  // values_override: {},
                  //
                  timeout_sec: 60,
                  auto_approve: false,
                  terraform_variables_source: {
                    tf_vars: [],
                    tf_var_file_paths: [],
                  },
                  provider: 'TERRAFORM',
                  provider_version: {
                    read_from_terraform_block: false,
                    explicit_version: '1.12.1',
                  },
                  job_resources: {
                    cpu_milli: 500,
                    ram_mib: 256,
                    storage_gb: 1000,
                  },
                }}
              />
            </Section>
            <Section className="gap-4">
              <Heading>Source</Heading>
              <SourceSetting />
              {watchFieldProvider === 'GIT' && (
                <div className="flex flex-col gap-3">
                  <GitProviderSetting />
                  {watchFieldIsPublicRepository ? (
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
                      {watchFieldGitProvider && (
                        <GitRepositorySetting gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} />
                      )}
                      {watchFieldGitProvider && watchFieldGitRepository && (
                        <GitBranchSettings
                          gitProvider={watchFieldGitProvider}
                          gitTokenId={watchFieldGitTokenId}
                          rootPathLabel="Root module path"
                          rootPathHint="Provide the folder path in the repository where the root module is located."
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </Section>
            {/* <Section className="gap-4">
              <Heading>Deploy</Heading>
              <DeploymentSetting />
              {watchFieldProvider === 'GIT' && !watchFieldIsPublicRepository && <AutoDeploySetting source="GIT" />}
              {watchFieldProvider === 'HELM_REPOSITORY' && (
                <Callout.Root color="sky" className="mt-5 items-center">
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
            </Section> */}
            <div className="flex justify-between">
              <Button
                type="button"
                size="lg"
                color="neutral"
                variant="plain"
                onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={!(generalForm.formState.isValid && isGitSettingsValid)}>
                Continue
              </Button>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
