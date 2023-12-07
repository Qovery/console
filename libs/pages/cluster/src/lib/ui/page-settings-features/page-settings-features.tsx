import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { BlockContent, HelpSection, LoaderSpinner } from '@qovery/shared/ui'

export interface PageSettingsFeaturesProps {
  loading: boolean
  features?: ClusterFeature[]
  cloudProvider?: CloudProviderEnum
}

export function PageSettingsFeatures(props: PageSettingsFeaturesProps) {
  const { loading, features, cloudProvider } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-neutral-400">Features</h2>
        <BlockContent title="Configured features" classNameContent="p-0">
          {loading && (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-4" />
            </div>
          )}
          {features?.map((feature: ClusterFeature) => (
            <CardClusterFeature key={feature.id} feature={feature} cloudProvider={cloudProvider} disabled />
          ))}
        </BlockContent>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#creating-an-eks-cluster-multiple-node-cluster',
            linkLabel: 'How to configure my cluster',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsFeatures
