import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ValuesOverrideArgumentsSetting } from '@qovery/domains/service-helm/feature'
import { SERVICES_HELM_CREATION_SUMMARY_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepValuesOverrideArgumentsFeature() {
  useDocumentTitle('General - Values override as arguments')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { networkingForm, setCurrentStep } = useHelmCreateContext()

  const navigate = useNavigate()
  setCurrentStep(4)

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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
            linkLabel: 'How to configure my Helm chart',
          },
        ],
      }}
    />
  )

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`
  const onSubmit = networkingForm.handleSubmit(() => {
    navigate(pathCreate + SERVICES_HELM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...networkingForm}>
        <ValuesOverrideArgumentsSetting>
          <div className="flex justify-between mt-10">
            <Button type="button" size="lg" variant="surface" color="neutral" onClick={() => navigate(-1)}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button type="submit" size="lg" onClick={onSubmit}>
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
