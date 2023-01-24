import { ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { ClusterGeneralData, LoadingStatus } from '@qovery/shared/interfaces'
import { IconAwesomeEnum, IconFa, InputSelect } from '@qovery/shared/ui'

export interface ClusterCredentialsSettingsProps {
  credentials: {
    loadingStatus: LoadingStatus
    items: ClusterCredentials[]
  }
}

export function ClusterCredentialsSettings(props: ClusterCredentialsSettingsProps) {
  const { credentials } = props
  const { control } = useFormContext<ClusterGeneralData>()

  const buildCredentials = credentials.items.map((item: ClusterCredentials) => ({
    label: item.name,
    value: item.id,
  }))

  return (
    <div>
      <Controller
        name="credentials"
        control={control}
        rules={{
          required: 'Please select a credential.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-credentials"
            label="Credentials"
            className="mb-3"
            options={[
              ...buildCredentials,
              {
                label: 'New credentials',
                value: 'new',
                icon: <IconFa name={IconAwesomeEnum.CIRCLE_PLUS} className="text-brand-500" />,
                externalClick: () => console.log('hello'),
              },
            ]}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            isSearchable
          />
        )}
      />
    </div>
  )
}

export default ClusterCredentialsSettings
