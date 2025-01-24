import { type CloudProvider, CloudProviderEnum, type ClusterRegion } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterCredentialsSettingsFeature, ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { type ClusterGeneralData, type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import { CLUSTERS_NEW_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import {
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  IconFlag,
  InputSelect,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { defaultResourcesData } from '../../../feature/page-clusters-create-feature/page-clusters-create-feature'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProviders: CloudProvider[]
  currentCloudProvider?: CloudProviderEnum
  setResourcesData?: (data: ClusterResourcesData) => void
}

export function StepGeneral(props: StepGeneralProps) {
  const { onSubmit, cloudProviders = [], currentCloudProvider, setResourcesData } = props
  const { control, formState, watch } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const [currentProvider, setCurrentProvider] = useState<CloudProvider | undefined>(
    cloudProviders.filter((cloudProvider: CloudProvider) => cloudProvider.short_name === currentCloudProvider)[0]
  )

  const buildCloudProviders: Value[] = useMemo(
    () =>
      cloudProviders.map((value) => ({
        label: upperCaseFirstLetter(value.name),
        value: value.short_name || '',
        icon: <Icon name={value.short_name || CloudProviderEnum.AWS} className="w-4" />,
      })),
    [cloudProviders]
  )

  const buildRegions: Value[] = useMemo(
    () =>
      currentProvider?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) || [],
    [currentProvider?.regions]
  )

  const watchCloudProvider = watch('cloud_provider')

  useEffect(() => {
    const currentProvider = cloudProviders?.filter(
      (cloud) => cloud.short_name === watchCloudProvider && cloud.regions
    )[0]
    setCurrentProvider(currentProvider as CloudProvider)
  }, [cloudProviders, watchCloudProvider])

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">General information</Heading>
        <p className="mb-2 text-sm text-neutral-400">Provide here some general information for your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <>
          <div className="mb-10">
            <h4 className="mb-4 text-sm text-neutral-400">General</h4>
            <ClusterGeneralSettings />
          </div>
          <div className="mb-10">
            <h4 className="mb-3 text-sm text-neutral-400">Provider credentials</h4>
            {cloudProviders.length > 0 ? (
              <>
                <Controller
                  name="cloud_provider"
                  control={control}
                  rules={{
                    required: 'Please select a cloud provider.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      dataTestId="input-cloud-provider"
                      label="Cloud provider"
                      className="mb-3"
                      options={buildCloudProviders}
                      onChange={(value) => {
                        field.onChange(value)
                        setResourcesData && setResourcesData(defaultResourcesData)
                      }}
                      value={field.value}
                      error={error?.message}
                      portal
                    />
                  )}
                />
                {currentProvider && (
                  <>
                    <Controller
                      name="region"
                      control={control}
                      rules={{
                        required: 'Please select a region.',
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelect
                          dataTestId="input-region"
                          label="Region"
                          className="mb-3"
                          options={buildRegions}
                          onChange={field.onChange}
                          value={field.value}
                          error={error?.message}
                          isSearchable
                          portal
                        />
                      )}
                    />
                    <ClusterCredentialsSettingsFeature
                      cloudProvider={currentProvider.short_name as CloudProviderEnum}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="mt-2 flex justify-center">
                <LoaderSpinner className="w-4" />
              </div>
            )}
          </div>
        </>

        <div className="flex justify-between">
          <Button
            size="lg"
            type="button"
            variant="plain"
            color="neutral"
            onClick={() => navigate(CLUSTERS_URL(organizationId) + CLUSTERS_NEW_URL)}
          >
            Cancel
          </Button>
          <Button size="lg" data-testid="button-submit" type="submit" disabled={!formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
