import { CloudProvider, CloudProviderEnum, ClusterRegion } from 'qovery-typescript-axios'
import { FormEventHandler, useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterCredentialsSettingsFeature, ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { ClusterGeneralData, Value } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  Icon,
  IconFlag,
  InputSelect,
  LoaderSpinner,
  WarningBox,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProviders: CloudProvider[]
}

export function StepGeneral(props: StepGeneralProps) {
  const { onSubmit, cloudProviders = [] } = props
  const { control, formState } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const [currentProvider, setCurrentProvider] = useState<CloudProvider>()

  useEffect(() => {
    const providerByDefault = cloudProviders?.filter((cloud) => cloud.short_name === CloudProviderEnum.AWS)[0]
    setCurrentProvider(providerByDefault)
  }, [cloudProviders])

  const buildCloudProviders: Value[] = cloudProviders.map((value) => ({
    label: upperCaseFirstLetter(value.name) || '',
    value: value.short_name || '',
    icon: <Icon name={value.short_name || CloudProviderEnum.AWS} className="w-4" />,
    // disabled temporally Digital Ocean
    isDisabled: value.short_name === CloudProviderEnum.DO ? true : false,
  }))

  const buildRegions =
    currentProvider?.regions?.map((region: ClusterRegion) => ({
      label: `${region.city} (${region.name})`,
      value: region.name,
      icon: <IconFlag code={region.country_code} />,
    })) || []

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">General informations</h3>
        <p className="text-text-500 text-sm mb-2">Provide here some general information for your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          <h4 className="mb-4 text-text-700 text-sm">General</h4>
          <ClusterGeneralSettings />
        </div>
        <div className="mb-10">
          <h4 className="mb-3 text-text-700 text-sm">Provider credentials</h4>
          {currentProvider ? (
            <>
              <WarningBox
                className="mb-4"
                title="Warning"
                message="The creation of clusters on Digital Ocean is temporarily disabled."
              />
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
                      const currentProvider = cloudProviders?.filter(
                        (cloud) => cloud.short_name === value && cloud.regions
                      )[0]
                      setCurrentProvider(currentProvider as CloudProvider)
                      field.onChange(value)
                    }}
                    value={field.value}
                    error={error?.message}
                    portal
                  />
                )}
              />
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
              <ClusterCredentialsSettingsFeature cloudProvider={currentProvider.short_name as CloudProviderEnum} />
            </>
          ) : (
            <div className="flex justify-center mt-2">
              <LoaderSpinner className="w-4" />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(CLUSTERS_URL(organizationId))}
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Cancel
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepGeneral
