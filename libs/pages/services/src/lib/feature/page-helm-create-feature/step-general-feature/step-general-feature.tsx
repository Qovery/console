import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { DeploymentSetting, SourceSetting } from '@qovery/domains/service-helm/feature'
import { AutoDeploySetting, GeneralSetting } from '@qovery/domains/services/feature'
import {
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_1_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  Button,
  Callout,
  FunnelFlowBody,
  FunnelFlowHelpCard,
  Heading,
  Icon,
  Section,
  toastError,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Helm')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { generalForm, setCurrentStep } = useHelmCreateContext()
  const navigate = useNavigate()
  setCurrentStep(1)

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Deploying a Helm Chart"
      items={[
        'You can deploy a Helm chart from a Helm repository or from a git repository.',
        'Helm repositories can be private or public. Repositories are managed at organization level by the admin.',
        'Deploying the chart from your private git repository allows you to benefit from the auto-deploy feature and deploy it at every new commit.',
        'By default resources are deployed on the namespace of the Qovery environment. You can deploy outside this namespace by enabling the flag “Allow cluster-wide resources”',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/',
            linkLabel: 'How to configure my Helm chart',
          },
        ],
      }}
    />
  )

  const onSubmit = generalForm.handleSubmit((data) => {
    if (data.arguments) {
      try {
        eval(data.arguments)
      } catch (e: unknown) {
        toastError(e as Error, 'Invalid Helm arguments')
        return
      }
    }

    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`
    navigate(pathCreate + SERVICES_HELM_CREATION_VALUES_STEP_1_URL)
  })

  const watchFieldProvider = generalForm.watch('source_provider')
  const watchFieldGitProvider = generalForm.watch('provider')
  const watchFieldGitTokenId = generalForm.watch('git_token_id')
  const watchFieldGitRepository = generalForm.watch('repository')
  const watchFieldIsPublicRepository = generalForm.watch('is_public_repository')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchFieldProvider === 'GIT' ? generalForm.watch('branch') : true

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...generalForm}>
        <Section>
          <form onSubmit={onSubmit}>
            <Heading className="mb-2">General Data</Heading>
            <p className="text-sm text-neutral-350">
              General settings allow you to set up the service name, the source and deployment parameters.
            </p>
            <Section>
              <Heading className="mt-10 mb-3">General</Heading>
              <GeneralSetting label="Helm chart name" />
            </Section>
            <Section>
              <Heading className="mt-10 mb-2">Source</Heading>
              <p className="text-sm text-neutral-350 mb-3">
                Deploy your helm chart from a Git repository or from a Helm repository.
              </p>
              <SourceSetting />
              {watchFieldProvider === 'GIT' && (
                <div className="flex flex-col gap-3 mt-3">
                  <GitProviderSetting />
                  {watchFieldIsPublicRepository ? (
                    <GitPublicRepositorySettings />
                  ) : (
                    <>
                      {watchFieldGitProvider && (
                        <GitRepositorySetting gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} />
                      )}
                      {watchFieldGitProvider && watchFieldGitRepository && (
                        <GitBranchSettings gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} />
                      )}
                    </>
                  )}
                </div>
              )}
            </Section>
            <Section>
              <Heading className="mt-10 mb-2">Deployment</Heading>
              <p className="text-sm text-neutral-350 mb-3">Define the deployment configuration of your service.</p>
              <DeploymentSetting />
              {watchFieldProvider === 'GIT' && <AutoDeploySetting source="GIT" className="mt-5" />}
              {watchFieldProvider === 'HELM_REPOSITORY' && (
                <Callout.Root color="sky" className="mt-5">
                  <Callout.Icon>
                    <Icon iconName="circle-info" />
                  </Callout.Icon>
                  <Callout.Text className="text-xs">
                    <Callout.TextHeading>
                      Auto-deploy is not available for helms coming from helm repositories
                    </Callout.TextHeading>
                  </Callout.Text>
                </Callout.Root>
              )}
            </Section>
            <div className="flex justify-between mt-10">
              <Button
                type="button"
                size="lg"
                color="neutral"
                variant="surface"
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
