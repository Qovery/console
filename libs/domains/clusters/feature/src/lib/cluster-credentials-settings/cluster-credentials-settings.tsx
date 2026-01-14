import { useParams } from '@tanstack/react-router'
import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import {
  CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  SETTINGS_CREDENTIALS_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
import { Callout, ExternalLink, Icon, InputSelect, Link, LoaderSpinner, useModal } from '@qovery/shared/ui'
import { ClusterCredentialsModal } from '../cluster-credentials-modal/cluster-credentials-modal'

export interface ClusterCredentialsSettingsProps {
  cloudProvider?: CloudProviderEnum
  isSetting?: boolean
}

export function ClusterCredentialsSettings({ cloudProvider, isSetting }: ClusterCredentialsSettingsProps) {
  const { organizationId = '', clusterId } = useParams({ strict: false })
  const { control, formState } = useFormContext()
  const { openModal, closeModal } = useModal()

  const { data: credentials = [], isLoading } = useCloudProviderCredentials({
    organizationId,
    cloudProvider,
  })
  const sortedCredentials = credentials.sort((a, b) => a.name.localeCompare(b.name))

  const openCredentialsModal = (id?: string, onChange?: (e: string | string[]) => void) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          clusterId={clusterId}
          onClose={(response) => {
            response && onChange?.(response.id)
            closeModal()
          }}
          credential={sortedCredentials.find((currentCredentials: ClusterCredentials) => currentCredentials.id === id)}
          cloudProvider={cloudProvider}
        />
      ),
      options: {
        width: 680,
      },
    })
  }

  const buildCredentials = sortedCredentials.map((item: ClusterCredentials) => ({
    label: `${item.name}${'access_key_id' in item ? ` (${item.access_key_id})` : ''}`,
    value: item.id,
    onClickEditable: !isSetting ? () => openCredentialsModal(item.id) : undefined,
  }))

  return (
    <div>
      {isLoading ? (
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
                options={buildCredentials}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                isSearchable
                menuListButton={{
                  title: 'Select credential',
                  label: 'New credential',
                  icon: <Icon iconName="circle-plus" className="text-brand" />,
                  onClick: () => openCredentialsModal(undefined, field.onChange),
                }}
              />
            )}
          />

          <Link color="brand" to={`${SETTINGS_URL(organizationId)}${SETTINGS_CREDENTIALS_URL}`} className="flex gap-1">
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
