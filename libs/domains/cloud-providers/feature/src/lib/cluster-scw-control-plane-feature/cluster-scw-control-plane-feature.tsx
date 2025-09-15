import { Controller, useFormContext } from 'react-hook-form'
import { type SCWControlPlaneFeatureType } from '@qovery/shared/interfaces'
import { type Value } from '@qovery/shared/interfaces'
import { Callout, ExternalLink, Heading, Icon, InputSelect, Tooltip } from '@qovery/shared/ui'
import { useCloudProviderFeatures } from '../hooks/use-cloud-provider-features/use-cloud-provider-features'

export const SCW_CONTROL_PLANE_FEATURE_ID = 'SCW_CONTROL_PLANE_TYPE'

export const CONTROL_PLANE_LABELS = {
  KAPSULE: 'Mutualized',
  KAPSULE_DEDICATED4: 'Dedicated 4',
  KAPSULE_DEDICATED8: 'Dedicated 8',
  KAPSULE_DEDICATED16: 'Dedicated 16',
}

export const CONTROL_PLANE_SPECS = {
  KAPSULE: '4 GB / 1vCPU / 150 nodes',
  KAPSULE_DEDICATED4: '4 GB / 2vCPU / 250 nodes',
  KAPSULE_DEDICATED8: '8 GB / 2vCPU / 500 nodes',
  KAPSULE_DEDICATED16: '16 GB / 4vCPU / 500 nodes',
}

export interface ClusterSCWControlPlaneFeatureInterface {
  production: boolean
}

export function ClusterSCWControlPlaneFeature({ production }: ClusterSCWControlPlaneFeatureInterface) {
  const { data: features } = useCloudProviderFeatures({
    cloudProvider: 'SCW',
  })
  const controlPlane = features?.find((feature) => feature.id === SCW_CONTROL_PLANE_FEATURE_ID)

  const options: Value[] =
    controlPlane?.accepted_values?.map((value) => ({
      label: CONTROL_PLANE_LABELS[value as keyof typeof CONTROL_PLANE_LABELS],
      value: value as string,
      description: CONTROL_PLANE_SPECS[value as keyof typeof CONTROL_PLANE_SPECS],
    })) || []

  const { control, formState, watch } = useFormContext<{ scw_control_plane: SCWControlPlaneFeatureType }>()
  const watchControlPlane = watch('scw_control_plane')

  const previousControlPlane = formState.defaultValues?.scw_control_plane

  // Define the control plane hierarchy (from lowest to highest tier)
  // Extract the hierarchy directly from the CONTROL_PLANE_LABELS
  const controlPlaneTiers = Object.keys(CONTROL_PLANE_LABELS) as SCWControlPlaneFeatureType[]

  // Get tier indices for comparison
  const previousTierIndex = previousControlPlane ? controlPlaneTiers.indexOf(previousControlPlane) : -1
  const currentTierIndex = watchControlPlane ? controlPlaneTiers.indexOf(watchControlPlane) : -1

  // Check if there's a downgrade (moving to a lower tier)
  const isDowngrade = previousControlPlane && currentTierIndex >= 0 && previousTierIndex > currentTierIndex

  // Show warning message based on selected control plane type
  // We want to show warnings regardless of whether the form is dirty
  const isDedicatedPlan = watchControlPlane && watchControlPlane !== 'KAPSULE'

  // We should show a warning either for downgrade or for dedicated plans
  const showWarning = isDowngrade || isDedicatedPlan

  return (
    <div className="flex flex-col gap-4">
      <Heading className="flex items-center gap-1.5">
        Control plane type
        <Tooltip
          content={
            <span>
              Choose the control plane type based on your performance and isolation:{' '}
              <ExternalLink
                size="xs"
                href="https://www.scaleway.com/en/docs/kubernetes/reference-content/kubernetes-control-plane-offers/"
              >
                Scaleway documentation
              </ExternalLink>
            </span>
          }
        >
          <span className="relative top-0.5">
            <Icon iconName="circle-info" iconStyle="regular" />
          </span>
        </Tooltip>
      </Heading>
      <Controller
        defaultValue={production ? 'KAPSULE_DEDICATED4' : 'KAPSULE'}
        name="scw_control_plane"
        control={control}
        rules={{
          required: 'Please select a value.',
        }}
        render={({ field }) => (
          <InputSelect options={options} onChange={field.onChange} value={field.value} label="Type" portal={true} />
        )}
      />
      {showWarning && (
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          {isDowngrade ? (
            <Callout.Text>
              Please note that there is a 30-day commitment period before downgrading to a lower tier Control Plane
            </Callout.Text>
          ) : isDedicatedPlan ? (
            <Callout.Text>
              By selecting this control plane, additional costs will be incurred. For more details, you can refer to
              this{' '}
              <ExternalLink href="https://www.scaleway.com/en/kubernetes-dedicated-control-plane/">
                documentation
              </ExternalLink>
            </Callout.Text>
          ) : null}
        </Callout.Root>
      )}
    </div>
  )
}

export default ClusterSCWControlPlaneFeature
