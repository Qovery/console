import { Heading, HelpSection, Section } from '@qovery/shared/ui'

interface PageSettingsKubeconfigProps {}

export function PageSettingsKubeconfig({}: PageSettingsKubeconfigProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Kubeconfig</Heading>
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#what-is-a-cluster',
            linkLabel: 'How to configure my cluster',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsKubeconfig
