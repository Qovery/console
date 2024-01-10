import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ValuesOverrideArgumentsSetting } from '@qovery/domains/service-helm/feature'
import { SERVICES_HELM_CREATION_NETWORKING_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { getGitTokenValue } from '@qovery/shared/util-git'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepValuesOverrideArgumentsFeature() {
  useDocumentTitle('General - Values override as arguments')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { generalForm, setCurrentStep, valuesOverrideArgumentsForm } = useHelmCreateContext()

  const generalData = generalForm.getValues()

  const source = match(generalData.source_provider)
    .with('GIT', () => {
      const gitToken = getGitTokenValue(generalData.provider ?? '')

      return {
        git_repository: {
          url: buildGitRepoUrl(gitToken?.type ?? generalData.provider ?? '', generalData.repository),
          branch: generalData.branch,
          root_path: generalData.root_path,
        },
      }
    })
    .with('HELM_REPOSITORY', () => ({
      helm_repository: {
        repository: generalData.repository,
        chart_name: generalData.chart_name,
        chart_version: generalData.chart_version,
      },
    }))
    .exhaustive()

  const navigate = useNavigate()
  setCurrentStep(3)

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Values override as arguments"
      items={[
        'You can define additional overrides by passing one by one them in this section.',
        'Specify each override by declaring the variable name, value and its type. These will be passed via the --set, --set-string and --set-json helm argument depending on the selected type (Generic, String or Json).',
        'Values set here have the higher override priority.',
        'Overrides can be passed in the “Helm arguments” field as well but we recommend to use this section.',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#values',
            linkLabel: 'How to configure my Helm chart',
          },
        ],
      }}
    />
  )

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`
  const onSubmit = valuesOverrideArgumentsForm.handleSubmit((data) => {
    navigate(pathCreate + SERVICES_HELM_CREATION_NETWORKING_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...valuesOverrideArgumentsForm}>
        <ValuesOverrideArgumentsSetting methods={valuesOverrideArgumentsForm} onSubmit={onSubmit} source={source}>
          <div className="flex justify-between mt-10">
            <Button type="button" size="lg" variant="surface" color="neutral" onClick={() => navigate(-1)}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                type="submit"
                size="lg"
                onClick={onSubmit}
                disabled={!valuesOverrideArgumentsForm.formState.isValid}
              >
                Continue
              </Button>
            </div>
          </div>
        </ValuesOverrideArgumentsSetting>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepValuesOverrideArgumentsFeature
