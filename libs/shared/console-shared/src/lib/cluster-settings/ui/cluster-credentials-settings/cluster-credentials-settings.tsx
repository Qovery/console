import { type ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  SETTINGS_CREDENTIALS_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
import { Callout, ExternalLink, Icon, InputSelect, Link, LoaderSpinner } from '@qovery/shared/ui'

export interface ClusterCredentialsSettingsProps {
  openCredentialsModal: (id?: string, onChange?: (e: string | string[]) => void) => void
  loading: boolean
  credentials?: ClusterCredentials[]
  isSetting?: boolean
}

export function ClusterCredentialsSettings(props: ClusterCredentialsSettingsProps) {
  const { organizationId = '', clusterId } = useParams()
  const { credentials, openCredentialsModal, loading, isSetting } = props
  const { control, formState } = useFormContext()

  const buildCredentials = credentials?.map((item: ClusterCredentials) => ({
    label: `${item.name}${'access_key_id' in item ? ` (${item.access_key_id})` : ''}`,
    value: item.id,
    onClickEditable: !isSetting ? () => openCredentialsModal(item.id) : undefined,
  }))

  return (
    <div>
      {loading ? (
        <div className="mt-2 flex justify-center">
          <LoaderSpinner className="w-4" />
        </div>
      ) : (
        <>
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

          <Link
            color="current"
            to={`${SETTINGS_URL(organizationId)}${SETTINGS_CREDENTIALS_URL}`}
            className="flex gap-1 text-brand-500"
          >
            See and edit all Cloud credentials
            <Icon iconName="key" iconStyle="regular" />
          </Link>

          {isSetting && formState.isDirty && (
            <Callout.Root color="yellow" className="mt-4">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextDescription className="flex flex-col gap-1">
                  The credential change won't be applied to the mirroring registry of this cluster. Make sure to update
                  the credentials properly in this cluster's mirroring registry section.
                  <ExternalLink
                    className="items-center"
                    href={
                      CLUSTER_URL(organizationId, clusterId) +
                      CLUSTER_SETTINGS_URL +
                      CLUSTER_SETTINGS_IMAGE_REGISTRY_URL
                    }
                  >
                    Go to mirroring registry section
                  </ExternalLink>
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
        </>
      )}
    </div>
  )
}

export default ClusterCredentialsSettings
