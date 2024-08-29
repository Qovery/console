import { type ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { Icon, InputSelect, LoaderSpinner } from '@qovery/shared/ui'

export interface ClusterCredentialsSettingsProps {
  credentials?: ClusterCredentials[]
  openCredentialsModal: (id?: string, onChange?: (e: string | string[]) => void) => void
  loading: boolean
}

export function ClusterCredentialsSettings(props: ClusterCredentialsSettingsProps) {
  const { credentials, openCredentialsModal, loading } = props
  const { control } = useFormContext()

  const buildCredentials = credentials?.map((item: ClusterCredentials) => ({
    label: `${item.name}${'access_key_id' in item ? ` (${item.access_key_id})` : ''}`,
    value: item.id,
    onClickEditable: () => openCredentialsModal(item.id),
  }))

  return (
    <div>
      {loading ? (
        <div className="mt-2 flex justify-center">
          <LoaderSpinner className="w-4" />
        </div>
      ) : (
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
              options={buildCredentials || []}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              isSearchable
              menuListButton={{
                title: 'Select credential',
                label: 'New credential',
                icon: <Icon iconName="circle-plus" className="text-brand-500" />,
                onClick: () => openCredentialsModal(undefined, field.onChange),
              }}
            />
          )}
        />
      )}
    </div>
  )
}

export default ClusterCredentialsSettings
