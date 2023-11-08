import { type ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconAwesomeEnum, IconFa, InputSelect, LoaderSpinner } from '@qovery/shared/ui'

export interface ClusterCredentialsSettingsProps {
  credentials?: ClusterCredentials[]
  openCredentialsModal: (id?: string) => void
  loading: boolean
}

export function ClusterCredentialsSettings(props: ClusterCredentialsSettingsProps) {
  const { credentials, openCredentialsModal, loading } = props
  const { control } = useFormContext()

  const buildCredentials = credentials?.map((item: ClusterCredentials) => ({
    label: item.name,
    value: item.id,
    onClickEditable: () => openCredentialsModal(item.id),
  }))

  return (
    <div>
      {loading ? (
        <div className="flex justify-center mt-2">
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
                label: 'New credentials',
                icon: <IconFa name={IconAwesomeEnum.CIRCLE_PLUS} className="text-brand-500" />,
                onClick: () => openCredentialsModal(),
              }}
            />
          )}
        />
      )}
    </div>
  )
}

export default ClusterCredentialsSettings
