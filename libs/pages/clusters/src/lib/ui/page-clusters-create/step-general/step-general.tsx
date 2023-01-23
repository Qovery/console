import { CloudProvider, CloudProviderEnum } from 'qovery-typescript-axios'
import { FormEventHandler, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterCredentialsSettingsFeature, ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { ClusterGeneralData, LoadingStatus } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, ButtonSize, ButtonStyle, Icon, InputSelect, WarningBox } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProviders?: CloudProvider[]
  cloudProviderLoadingStatus?: LoadingStatus
}

export function StepGeneral(props: StepGeneralProps) {
  const { onSubmit, cloudProviders = [] } = props
  const { control, formState } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const [currentProvider, setCurrentProvider] = useState<string>()

  const buildCloudProviders = cloudProviders.map((value) => ({
    label: upperCaseFirstLetter(value.name) || '',
    value: value.name || '',
    icon: <Icon name={value.short_name || CloudProviderEnum.AWS} className="w-4" />,
    // disabled temporally Digital Ocean
    isDisabled: value.short_name === CloudProviderEnum.DO ? true : false,
  }))

  console.log(currentProvider)

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
                  setCurrentProvider(value as string)
                  field.onChange(value)
                }}
                value={field.value}
                error={error?.message}
              />
            )}
          />
          <ClusterCredentialsSettingsFeature />
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
