import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { AutoDeploySetting, GeneralSetting } from '@qovery/domains/services/feature'
import { SERVICES_CREATION_RESOURCES_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, FunnelFlowHelpCard, Heading, Section } from '@qovery/shared/ui'
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
            linkLabel: 'How to configure my Helm chart',
          },
        ],
      }}
    />
  )

  const onSubmit = generalForm.handleSubmit((data) => {
    console.log(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...generalForm}>
        <form onSubmit={onSubmit}>
          <Section>
            <Heading className="mb-2">General Data</Heading>
            <p className="text-sm text-neutral-350">
              General settings allow you to set up the service name, the source and deployment parameters.
            </p>
            <Section>
              <Heading className="mt-10 mb-3">General</Heading>
              <GeneralSetting label="Helm chart name" />
            </Section>
            <Section>
              <Heading className="mt-10 mb-2">Deployment</Heading>
              <p className="text-sm text-neutral-350 mb-3">Define the deployment configuration of your service.</p>
              <AutoDeploySetting source="GIT" />
            </Section>
          </Section>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={!generalForm.formState.isValid}>
              Continue
            </Button>
          </div>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
