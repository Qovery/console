import { FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { NetworkingSetting } from '@qovery/domains/service-helm/feature'
import { SERVICES_HELM_CREATION_SUMMARY_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepNetworkingFeature() {
  useDocumentTitle('General - Networking')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { networkingForm, setCurrentStep } = useHelmCreateContext()

  const ports = networkingForm.watch('ports')

  const navigate = useNavigate()
  setCurrentStep(4)

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Networking configuration"
      items={[
        'Qovery can expose your services by automatically configuring the Kubernetes ingress, assigning a public domain and managing the TLS for you.',
        'Declare the Kubernetes service and the port you want to expose over HTTP/gRCP',
        'If you want to manage the ingress configuration by yourself, have a look at the documentation below',
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

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`
  const onSubmit = networkingForm.handleSubmit(() => {
    navigate(pathCreate + SERVICES_HELM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...networkingForm}>
        <NetworkingSetting
          ports={ports}
          onUpdatePorts={(updatedPorts) => networkingForm.setValue('ports', updatedPorts)}
        >
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
        </NetworkingSetting>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepNetworkingFeature
