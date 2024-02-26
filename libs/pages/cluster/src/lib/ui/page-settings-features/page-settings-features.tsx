import { type CloudProviderEnum, type ClusterFeature } from 'qovery-typescript-axios'
import { CardClusterFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { BlockContent, Heading, HelpSection, Icon, InputText, LoaderSpinner, Section } from '@qovery/shared/ui'

export interface PageSettingsFeaturesProps {
  loading: boolean
  features?: ClusterFeature[]
  cloudProvider?: CloudProviderEnum
}

export function PageSettingsFeatures(props: PageSettingsFeaturesProps) {
  const { loading, features, cloudProvider } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Features</Heading>
        <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250">
          <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
          <p className="text-neutral-350 text-sm mb-4">In your VPC settings, you have enable the DNS hostnames.</p>
          <InputText name="vpc_id" label="VPC ID" value="subnet-06aa1f94d55e81677" className="mb-4" disabled />
          <ul className="grid grid-cols-3 gap-4">
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">
                <Icon name={IconEnum.HELM} width="16" className="mr-2" />
                EKS subnet IDs A:
              </span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone B:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone C:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">
                <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
                MongoDB subnet IDs A:
              </span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone B:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone C:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">
                <Icon name={IconEnum.MYSQL} width="16" className="mr-2" />
                MySQL subnet IDs A:
              </span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone B:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone C:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">
                <Icon name={IconEnum.POSTGRESQL} width="16" className="mr-2" />
                PostgreSQL subnet IDs A:
              </span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone B:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone C:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">
                <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
                Redis subnet IDs A:
              </span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone B:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
            <li className="flex flex-col text-neutral-400 text-xs gap-1">
              <span className="flex items-center font-medium">zone C:</span>
              <span>subnet-06aa1f94d55e81677</span>
              <span>subnet-06aa1f94d55e81677</span>
            </li>
          </ul>
        </div>

        <BlockContent title="Configured features" classNameContent="p-0">
          {loading && (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-4" />
            </div>
          )}
          {
            // TODO: hide existing VPC feature for now
            features
              ?.filter(({ id }) => id !== 'EXISTING_VPC')
              .map((feature: ClusterFeature) => (
                <CardClusterFeature key={feature.id} feature={feature} cloudProvider={cloudProvider} disabled />
              ))
          }
        </BlockContent>
      </Section>
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
