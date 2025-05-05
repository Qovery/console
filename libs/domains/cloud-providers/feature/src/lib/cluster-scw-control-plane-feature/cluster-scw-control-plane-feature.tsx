import { Controller, useFormContext } from 'react-hook-form'
import { type SCWControlPlaneFeatureType } from '@qovery/shared/interfaces'
import { Callout, ExternalLink, Heading, Icon, InputSelect } from '@qovery/shared/ui'
import { useCloudProviderFeatures } from '../hooks/use-cloud-provider-features/use-cloud-provider-features'

export const SCW_CONTROL_PLANE_FEATURE_ID = 'SCW_CONTROL_PLANE_TYPE'

export const CONTROL_PLANE_LABELS = {
  KAPSULE: 'Mutualized',
  KAPSULE_DEDICATED4: 'Dedicated 4',
  KAPSULE_DEDICATED8: 'Dedicated 8',
  KAPSULE_DEDICATED16: 'Dedicated 16',
}

export function ClusterSCWControlPlaneFeature() {
  const { data: features } = useCloudProviderFeatures({
    cloudProvider: 'SCW',
  })

  const controlPlane = features?.find((feature) => feature.id === SCW_CONTROL_PLANE_FEATURE_ID)

  const options =
    controlPlane?.accepted_values?.map((value) => ({
      label: CONTROL_PLANE_LABELS[value as keyof typeof CONTROL_PLANE_LABELS],
      value: value as string,
    })) || []

  const { control, formState, watch } = useFormContext<{ scw_control_plane: SCWControlPlaneFeatureType }>()
  const watchControlPlane = watch('scw_control_plane')

  return (
    <div className="flex flex-col gap-4">
      <Heading>Control plane type</Heading>
      <Controller
        defaultValue="KAPSULE"
        name="scw_control_plane"
        control={control}
        rules={{
          required: 'Please select a value.',
        }}
        render={({ field }) => (
          <InputSelect options={options} onChange={field.onChange} value={field.value} label="Type" portal={true} />
        )}
      />
      {formState.isDirty && (
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="info-circle" iconStyle="regular" />
          </Callout.Icon>
          {watchControlPlane === 'KAPSULE' ? (
            <Callout.Text>
              Please note that there is a 30-day commitment period before downgrading to the Mutualized Control Plane
              again
            </Callout.Text>
          ) : (
            <Callout.Text>
              By selecting this control plane, additional costs will be incurred. For more details, you can refer to
              this{' '}
              <ExternalLink href="https://www.scaleway.com/en/kubernetes-dedicated-control-plane/">
                documentation
              </ExternalLink>
            </Callout.Text>
          )}
        </Callout.Root>
      )}
    </div>
  )
}

export default ClusterSCWControlPlaneFeature
