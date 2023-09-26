import { type ClusterInstanceTypeResponseListResults } from 'qovery-typescript-axios'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterRemoteData,
  type ClusterResourcesData,
} from '@qovery/shared/interfaces'
import {
  BannerBox,
  BannerBoxEnum,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacy,
  ButtonSize,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  Link,
} from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: ClusterGeneralData
  resourcesData: ClusterResourcesData
  featuresData?: ClusterFeaturesData
  remoteData?: ClusterRemoteData
  goToFeatures: () => void
  goToResources: () => void
  goToGeneral: () => void
  goToRemote: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  detailInstanceType?: ClusterInstanceTypeResponseListResults
}

export function StepSummary(props: StepSummaryProps) {
  const checkIfFeaturesAvailable = () => {
    const feature = []

    if (props.featuresData) {
      for (let i = 0; i < Object.keys(props.featuresData).length; i++) {
        const id = Object.keys(props.featuresData)[i]
        const currentFeature = props.featuresData[id]
        if (currentFeature.value) feature.push(id)
      }
    }

    return feature.length > 0
  }

  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-neutral-400 text-lg">Ready to install your cluster</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-2">
          Here is what we will deploy, this action can take up to 30 minutes.
        </p>
      </div>

      <div className="mb-10">
        <BannerBox
          className="mb-5"
          title="Qovery manages this resource for you"
          message={
            <span>
              Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
              <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
              drift in the configuration.
              <Link
                className="ml-0.5"
                size="text-xs"
                link="https://hub.qovery.com/docs/useful-resources/faq/#how-do-you-support-new-kubernetes-version"
                linkLabel="See more details"
                external
              />
            </span>
          }
          type={BannerBoxEnum.WARNING}
        />
        <div
          data-testid="summary-general"
          className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
        >
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">General information</div>
            <ul className="text-neutral-350 text-sm list-none">
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

        <div
          data-testid="summary-resources"
          className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
        >
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
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

        {props.remoteData && props.remoteData.ssh_key.length > 0 && (
          <div
            data-testid="summary-remote"
            className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2"
          >
            <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
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
            <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
            <div className="flex-grow mr-2">
              <div className="text-sm text-neutral-400 font-bold mb-2">Features</div>
              <ul className="text-neutral-350 text-sm list-none">
                {Object.keys(props.featuresData).map((id: string) => {
                  const currentFeature = props.featuresData && props.featuresData[id]

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
          <ButtonLegacy
            onClick={props.onPrevious}
            className="btn--no-min-w"
            type="button"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <div className="flex gap-2">
            <ButtonLegacy
              dataTestId="button-create"
              loading={props.isLoadingCreate}
              onClick={() => props.onSubmit(false)}
              size={ButtonSize.XLARGE}
              style={ButtonStyle.STROKED}
              className="btn--no-min-w"
            >
              Create
            </ButtonLegacy>
            <ButtonLegacy
              dataTestId="button-create-deploy"
              loading={props.isLoadingCreateAndDeploy}
              onClick={() => props.onSubmit(true)}
              size={ButtonSize.XLARGE}
              style={ButtonStyle.BASIC}
            >
              Create and install
            </ButtonLegacy>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepSummary
