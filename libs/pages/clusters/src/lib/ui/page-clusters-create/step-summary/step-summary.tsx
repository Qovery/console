import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterKubeconfigData,
  type ClusterRemoteData,
  type ClusterResourcesData,
} from '@qovery/shared/interfaces'
import {
  Button,
  ButtonIcon,
  ButtonIconStyle,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  IconAwesomeEnum,
  Section,
} from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: ClusterGeneralData
  kubeconfigData?: ClusterKubeconfigData
  resourcesData: ClusterResourcesData
  featuresData?: ClusterFeaturesData
  remoteData?: ClusterRemoteData
  goToFeatures: () => void
  goToResources: () => void
  goToKubeconfig: () => void
  goToGeneral: () => void
  goToRemote: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  detailInstanceType?: ClusterInstanceTypeResponseListResultsInner
}

export function StepSummary(props: StepSummaryProps) {
  const checkIfFeaturesAvailable = () => {
    const feature = []

    if (props.featuresData) {
      if (props.featuresData?.aws_existing_vpc) return true

      for (let i = 0; i < Object.keys(props.featuresData.features).length; i++) {
        const id = Object.keys(props.featuresData.features)[i]
        const currentFeature = props.featuresData.features[id]
        if (currentFeature.value) feature.push(id)
      }
    }

    return feature.length > 0
  }

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Ready to install your cluster</Heading>
        <p className="text-xs text-neutral-400 mb-2">
          Here is what we will deploy, this action can take up to 30 minutes.
        </p>
      </div>

      <div className="mb-10">
        {props.generalData.installation_type === 'MANAGED' && (
          <Callout.Root color="yellow" className="mb-5">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
              <Callout.TextDescription className="text-xs">
                Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                drift in the configuration.
                <ExternalLink
                  className="ml-0.5"
                  size="xs"
                  href="https://hub.qovery.com/docs/useful-resources/faq/#how-do-you-support-new-kubernetes-version"
                >
                  See more details
                </ExternalLink>
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
        <div
          data-testid="summary-general"
          className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
        >
          <Icon iconName="check" className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">General information</div>
            <ul className="text-neutral-350 text-sm list-none">
              <li>
                Installation type:{' '}
                <strong className="font-medium">
                  {match(props.generalData.installation_type)
                    .with('MANAGED', () => 'Managed')
                    .with('SELF_MANAGED', () => 'Self-Managed')
                    .exhaustive()}
                </strong>
              </li>
              <li>
                Cluster name: <strong className="font-medium">{props.generalData.name}</strong>
              </li>
              {props.generalData.production && (
                <li>
                  Production: <strong className="font-medium">true</strong>
                </li>
              )}
              <li>
                Provider:{' '}
                <strong className="font-medium inline-flex items-center">
                  <Icon className="ml-1 w-4" name={props.generalData.cloud_provider} />
                </strong>
              </li>
              <li>
                Region: <strong className="font-medium">{props.generalData.region}</strong>
              </li>
            </ul>
          </div>

          <ButtonIcon
            onClick={props.goToGeneral}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-neutral-400 hover:text-neutral-400"
          />
        </div>

        {match(props.generalData)
          .with(
            { installation_type: 'MANAGED', cloud_provider: 'AWS' },
            { installation_type: 'MANAGED', cloud_provider: 'SCW' },
            () => (
              <div
                data-testid="summary-resources"
                className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
              >
                <Icon iconName="check" className="text-green-500 mr-2" />
                <div className="flex-grow mr-2">
                  <div className="text-sm text-neutral-400 font-bold mb-2">Resources</div>
                  <ul className="text-neutral-350 text-sm list-none">
                    <li>
                      Cluster type: <strong className="font-medium">{props.resourcesData.cluster_type}</strong>
                    </li>
                    <li>
                      Instance type:{' '}
                      <strong className="font-medium">
                        {props.detailInstanceType?.name} ({props.detailInstanceType?.cpu}CPU -{' '}
                        {props.detailInstanceType?.ram_in_gb}GB RAM - {props.detailInstanceType?.architecture})
                      </strong>
                    </li>
                    <li>
                      Disk size: <strong className="font-medium">{props.resourcesData.disk_size} GB</strong>
                    </li>
                    <li>
                      Nodes:{' '}
                      <strong className="font-medium">
                        {props.resourcesData.nodes[0]} min - {props.resourcesData.nodes[1]} max
                      </strong>
                    </li>
                  </ul>
                </div>
                <ButtonIcon
                  onClick={props.goToResources}
                  icon={IconAwesomeEnum.WHEEL}
                  style={ButtonIconStyle.FLAT}
                  className="text-neutral-400 hover:text-neutral-400"
                />
              </div>
            )
          )
          .with({ installation_type: 'SELF_MANAGED' }, () => (
            <div
              data-testid="summary-kubeconfig"
              className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
            >
              <Icon iconName="check" className="text-green-500 mr-2" />
              <div className="flex-grow mr-2">
                <div className="text-sm text-neutral-400 font-bold mb-2">Kubeconfig</div>
                <ul className="text-neutral-350 text-sm list-none">
                  <li>
                    Kubeconfig: <strong className="font-medium">{props.kubeconfigData?.file_name}</strong>
                  </li>
                </ul>
              </div>
              <ButtonIcon
                onClick={props.goToKubeconfig}
                icon={IconAwesomeEnum.WHEEL}
                style={ButtonIconStyle.FLAT}
                className="text-neutral-400 hover:text-neutral-400"
              />
            </div>
          ))
          .otherwise(() => null)}

        {props.remoteData && props.remoteData.ssh_key.length > 0 && (
          <div
            data-testid="summary-remote"
            className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
          >
            <Icon iconName="check" className="text-green-500 mr-2" />
            <div className="flex-grow mr-2">
              <div className="text-sm text-neutral-400 font-bold mb-2">Remote access</div>
              <ul className="text-neutral-350 text-sm list-none">
                <li>
                  SSH key: <strong className="font-medium">{trimId(props.remoteData.ssh_key, 'both')}</strong>
                </li>
              </ul>
            </div>
            <ButtonIcon
              onClick={props.goToRemote}
              icon={IconAwesomeEnum.WHEEL}
              style={ButtonIconStyle.FLAT}
              className="text-neutral-400 hover:text-neutral-400"
            />
          </div>
        )}

        {props.featuresData && checkIfFeaturesAvailable() && (
          <div
            data-testid="summary-features"
            className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
          >
            <Icon iconName="check" className="text-green-500 mr-2" />
            <div className="flex-grow mr-2">
              <div className="text-sm text-neutral-400 font-bold mb-2">Features</div>
              <ul className="text-neutral-350 text-sm list-none">
                {props.featuresData.aws_existing_vpc && (
                  <li>
                    Deploy on an existing VPC: <strong className="font-medium">test</strong>
                  </li>
                )}
                {Object.keys(props.featuresData.features).map((id: string) => {
                  const currentFeature = props.featuresData && props.featuresData.features[id]

                  if (!currentFeature?.value) return null

                  return (
                    <li key={id}>
                      {currentFeature.title}:{' '}
                      <strong className="font-medium">
                        {currentFeature.extendedValue ? currentFeature.extendedValue : currentFeature.value.toString()}
                      </strong>
                    </li>
                  )
                })}
              </ul>
            </div>
            <ButtonIcon
              onClick={props.goToFeatures}
              icon={IconAwesomeEnum.WHEEL}
              style={ButtonIconStyle.FLAT}
              className="text-neutral-400 hover:text-neutral-400"
            />
          </div>
        )}

        <div className="flex justify-between mt-10">
          <Button onClick={props.onPrevious} type="button" size="lg" color="neutral" variant="surface">
            Back
          </Button>
          <div className="flex gap-2">
            {props.generalData.installation_type === 'MANAGED' ? (
              <>
                <Button
                  data-testid="button-create"
                  loading={props.isLoadingCreate}
                  onClick={() => props.onSubmit(false)}
                  size="lg"
                  color="neutral"
                  variant="surface"
                >
                  Create
                </Button>
                <Button
                  data-testid="button-create-deploy"
                  loading={props.isLoadingCreateAndDeploy}
                  onClick={() => props.onSubmit(true)}
                  size="lg"
                >
                  Create and install
                </Button>
              </>
            ) : (
              <Button
                data-testid="button-create"
                loading={props.isLoadingCreate}
                onClick={() => props.onSubmit(false)}
                size="lg"
                color="brand"
                variant="solid"
              >
                Create
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default StepSummary
