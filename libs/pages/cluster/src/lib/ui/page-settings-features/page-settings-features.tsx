import { CloudProviderEnum, ClusterFeature } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BannerBox,
  BannerBoxEnum,
  BlockContent,
  HelpSection,
  InputToggle,
  LoaderSpinner,
  Tooltip,
} from '@qovery/shared/ui'

export interface PageSettingsFeaturesProps {
  loadingStatus: LoadingStatus
  features?: ClusterFeature[]
  cloudProvider?: CloudProviderEnum
}

export function PageSettingsFeatures(props: PageSettingsFeaturesProps) {
  const { loadingStatus, features, cloudProvider } = props

  const getValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return true
    }
    return value
  }

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Features</h2>
        <BannerBox
          className="mb-5"
          type={BannerBoxEnum.DEFAULT}
          title="From $70 to $450/month"
          message="Approximate cost charged by the cloud provider based on your consumption"
          icon={IconEnum.AWS}
          iconInCircle
        />
        <BlockContent title="Configured features" classNameContent="p-0">
          {loadingStatus !== 'loaded' && (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-4" />
            </div>
          )}
          {features?.map((feature: ClusterFeature, index: number) => (
            <div
              data-testid="feature"
              key={index}
              className="flex justify-between p-5 border-t border-element-light-lighter-500 first:border-0"
            >
              <div className="flex pr-8">
                <Tooltip content="This feature is defined at cluster creation and cannot be modified">
                  <div>
                    <InputToggle
                      className="relative top-[2px]"
                      disabled
                      small
                      value={getValue(feature.value || false)}
                    />
                  </div>
                </Tooltip>
                <div>
                  <h4 className="text-ssm text-text-600 mb-1 font-medium">{feature.title}</h4>
                  <p className="text-xs text-text-400">{feature.description}</p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="text-ssm text-text-600 font-medium">
                  ${feature.cost_per_month} by {cloudProvider}
                </span>
              </div>
            </div>
          ))}
        </BlockContent>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#creating-an-eks-cluster-multiple-node-cluster',
            linkLabel: 'How to configure my cluster',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsFeatures
