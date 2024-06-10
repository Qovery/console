import { type CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { CardClusterFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, LoaderSpinner, Section } from '@qovery/shared/ui'
import AWSExistingVPC from './aws-existing-vpc/aws-existing-vpc'
import GcpExistingVPC from './gcp-existing-vpc/gcp-existing-vpc'

export interface PageSettingsFeaturesProps {
  loading: boolean
  features?: ClusterFeatureResponse[]
  cloudProvider?: CloudProviderEnum
}

export function PageSettingsFeatures(props: PageSettingsFeaturesProps) {
  const { loading, features, cloudProvider } = props

  const featureExistingVpc = features?.find(({ id }) => id === 'EXISTING_VPC')
  const featureExistingVpcValue = featureExistingVpc?.value_object

  const featureExistingVpcContent = match(featureExistingVpcValue)
    .with({ type: 'AWS_USER_PROVIDED_NETWORK' }, (f) => <AWSExistingVPC feature={f.value} />)
    .with({ type: 'GCP_USER_PROVIDED_NETWORK' }, (f) => <GcpExistingVPC feature={f.value} />)
    .otherwise(() => null)

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Features" />

        {!loading && featureExistingVpcValue && featureExistingVpcContent}

        {!featureExistingVpcValue && (
          <BlockContent title="Configured features" classNameContent="p-0">
            {loading && (
              <div className="flex justify-center p-5">
                <LoaderSpinner className="w-4" />
              </div>
            )}
            {features
              ?.filter(({ id }) => id !== 'EXISTING_VPC' && id !== 'KARPENTER')
              .map((feature) => (
                <CardClusterFeature key={feature.id} feature={feature} cloudProvider={cloudProvider} disabled />
              ))}
          </BlockContent>
        )}
      </Section>
    </div>
  )
}

export default PageSettingsFeatures
