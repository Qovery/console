import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { GitBranchSettings, GitProviderSetting, GitRepositorySetting } from '@qovery/domains/organizations/feature'
import { SERVICES_HELM_CREATION_SUMMARY_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, FunnelFlowHelpCard, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepValuesOverrideRepositoryFeature() {
  useDocumentTitle('General - Values override - repository')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { valuesOverrideRepositoryForm, setCurrentStep } = useHelmCreateContext()
  const navigate = useNavigate()
  setCurrentStep(2)

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Using values overrides"
      items={[
        'Your helm chart might have already a variables.yaml file with some basic configuration. In this section you can define your own overrides to customize the helm chart behaviour.',
        'You can define the overrides by selecting a YAML file from a git repository, by passing a raw YAML file or by adding one by one your overrides. You can combine all the 3 methods.',
        'You can use the Qovery environment variables as overrides by using the placeholder “qovery.env.<env_var_name>” (Example: qovery.env.DB_URL. Qovery will manage the replacement of those placeholders at deployment time.',
        'To get all the Qovery functionalities, add the macro “qovery.labels.service” within the field managing the labels assigned to the deployed pods.',
        'Overrides can be passed in the “Helm arguments” field as well but we recommend to use this section.',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
            linkLabel: 'How to configure my Helm chart',
          },
        ],
      }}
    />
  )

  const onSubmit = valuesOverrideRepositoryForm.handleSubmit((data) => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`
    navigate(pathCreate + SERVICES_HELM_CREATION_SUMMARY_URL)
  })

  const watchFieldGitProvider = valuesOverrideRepositoryForm.watch('provider')
  const watchFieldGitRepository = valuesOverrideRepositoryForm.watch('repository')

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...valuesOverrideRepositoryForm}>
        <form onSubmit={onSubmit}>
          <Section>
            <Heading className="mb-2">Values override - repository</Heading>
            <p className="text-sm text-neutral-350">
              Define here the overrides you want to apply on top of the default values.yaml delivered with the chart.
              You can combine multiple override types and they will be applied using a specific order: From repository,
              Raw YAML, Manual. <br />
              Qovery environment variables can be used as overrides following the pattern “qovery.env.ENV_VAR_NAME”. To
              get all the Qovery functionalities, add the macro “qovery.labels.service” within the field setting the
              labels of the deployed resources.
            </p>
            <Section>
              <Heading className="mt-10 mb-2">Override from repository</Heading>
              <p className="text-sm text-neutral-350">
                Specify the repository and the path containing the override yaml file to be passed via the “-f” helm
                argument. More than one file can be used as override by adding them in the path field separated by a
                semi-colon. If you don’t have a repository, you can set the override manually or via a raw YAML file.
              </p>
              <div className="flex flex-col gap-3 mt-3">
                <GitProviderSetting />
                {watchFieldGitProvider && <GitRepositorySetting gitProvider={watchFieldGitProvider} />}
                {watchFieldGitProvider && watchFieldGitRepository && (
                  <GitBranchSettings gitProvider={watchFieldGitProvider} />
                )}
              </div>
            </Section>
          </Section>
          <div className="flex justify-between mt-10">
            <Button type="button" size="lg" variant="surface" color="neutral" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button type="submit" size="lg" disabled={!valuesOverrideRepositoryForm.formState.isValid}>
              Continue
            </Button>
          </div>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepValuesOverrideRepositoryFeature
