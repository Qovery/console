import { useParams } from '@tanstack/react-router'
import { type Cluster, type ClusterCredentials } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { isClusterEksManaged } from '@qovery/domains/clusters/data-access'
import {
  Button,
  Callout,
  EmptyState,
  ExternalLink,
  Icon,
  InputSelect,
  InputToggle,
  Link,
  LoaderSpinner,
  useModal,
} from '@qovery/shared/ui'
import {
  type ClusterCredentialAuthType,
  ClusterCredentialsModal,
  type ClusterCredentialsModalCloudProvider,
} from '../cluster-credentials-modal/cluster-credentials-modal'

// Extended permissions credentials must be an AWS role (assumed via STS)
const WIDE_PERMISSION_CREDENTIAL_TYPES: ClusterCredentialAuthType[] = ['STS']

export interface ClusterCredentialsSettingsProps {
  cloudProvider?: ClusterCredentialsModalCloudProvider
  isSetting?: boolean
  cluster?: Cluster
  isWideCredentialsEnabled?: boolean
}

export const filterWidePermissionCredentials = (credentials: ClusterCredentials[]) =>
  credentials.filter((credential) => credential.object_type === 'AWS_ROLE')

export const filterCredentialsByCloudProvider = (
  credentials: ClusterCredentials[],
  cloudProvider?: ClusterCredentialsModalCloudProvider
) => {
  if (cloudProvider !== 'AWS_EKS_ANYWHERE') {
    return credentials
  }

  return credentials.filter((credential) => credential.object_type === 'EKS_ANYWHERE_VSPHERE')
}

export function ClusterCredentialsSettings({
  cloudProvider,
  isSetting,
  cluster,
  isWideCredentialsEnabled = false,
}: ClusterCredentialsSettingsProps) {
  const { organizationId = '', clusterId } = useParams({ strict: false })
  const { control, getValues } = useFormContext()
  const { openModal, closeModal } = useModal()

  // useWatch subscribes this component itself, so it stays in sync even when the parent form is reset
  const usingRestrictivePermissions = useWatch({ control, name: 'using_restrictive_permissions' })
  const isUsingRestrictivePermissions = isWideCredentialsEnabled && Boolean(usingRestrictivePermissions)

  const queryCloudProvider = cloudProvider === 'AWS_EKS_ANYWHERE' ? 'AWS' : cloudProvider

  const isEksManaged = cluster !== undefined && isClusterEksManaged(cluster)

  const { data: credentials = [], isLoading } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: queryCloudProvider,
  })
  const sortedCredentials = [...filterCredentialsByCloudProvider(credentials, cloudProvider)].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const openCredentialsModal = useCallback(
    (id?: string, onChange?: (e: string | string[]) => void, allowedTypes?: ClusterCredentialAuthType[]) => {
      openModal({
        content: (
          <ClusterCredentialsModal
            organizationId={organizationId}
            clusterId={clusterId}
            onClose={(response) => {
              response && onChange?.(response.id)
              closeModal()
            }}
            credential={sortedCredentials.find(
              (currentCredentials: ClusterCredentials) => currentCredentials.id === id
            )}
            cloudProvider={cloudProvider}
            allowedTypes={allowedTypes}
          />
        ),
        options: {
          width: 680,
        },
      })
    },
    [cloudProvider, clusterId, closeModal, openModal, organizationId, sortedCredentials]
  )

  const toCredentialOption = (item: ClusterCredentials) => ({
    label: `${item.name}${'access_key_id' in item ? ` (${item.access_key_id})` : ''}`,
    value: item.id,
    onClickEditable: !isSetting ? () => openCredentialsModal(item.id) : undefined,
  })

  const buildCredentials = sortedCredentials.map(toCredentialOption)
  const buildWidePermissionCredentials = filterWidePermissionCredentials(sortedCredentials).map(toCredentialOption)

  return (
    <div>
      {isLoading ? (
        <div className="mt-2 flex justify-center">
          <LoaderSpinner className="w-4" />
        </div>
      ) : (
        <>
          {isSetting && isEksManaged && (
            <Callout.Root color="red" className="mb-4" data-testid="eks-credentials-change-warning">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>
                  {/* Only the restrictive credentials trigger a redeploy, not the toggle nor the extended credentials */}
                  {isWideCredentialsEnabled
                    ? 'Changing the restrictive credentials triggers a cluster redeployment'
                    : 'Changing credentials triggers a cluster redeployment'}
                </Callout.TextHeading>
                <Callout.TextDescription>
                  Saving new credentials will automatically redeploy the cluster to keep your services' deployments
                  working.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}

          {isWideCredentialsEnabled && (
            <Controller
              name="using_restrictive_permissions"
              control={control}
              render={({ field }) => (
                <InputToggle
                  dataTestId="input-restrictive-permissions-toggle"
                  className="mb-4"
                  value={Boolean(field.value)}
                  onChange={field.onChange}
                  title="Use restrictive permissions"
                  description="Qovery uses restrictive credentials for day-to-day operations and extended credentials (AWS role) only when wider access is required."
                  align="top"
                  small
                />
              )}
            />
          )}

          <Controller
            name="credentials"
            control={control}
            rules={{
              required: 'Please select a credential.',
            }}
            render={({ field, fieldState: { error } }) =>
              !isSetting && sortedCredentials.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon="key"
                  iconStyle="regular"
                  title="No cloud credentials"
                  description="Connect your cloud account to continue."
                  className="mb-3 border-dashed"
                >
                  <Button
                    type="button"
                    color="neutral"
                    variant="outline"
                    onClick={() => openCredentialsModal(undefined, field.onChange)}
                  >
                    <Icon iconName="circle-plus" iconStyle="regular" />
                    Add New Credential
                  </Button>
                </EmptyState>
              ) : (
                <InputSelect
                  dataTestId="input-credentials"
                  label={isUsingRestrictivePermissions ? 'Restrictive credentials' : 'Credentials'}
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
              )
            }
          />

          {isSetting && (
            <Link
              color="brand"
              to="/organization/$organizationId/settings/cloud-credentials"
              params={{ organizationId }}
              className="flex gap-1"
            >
              See and edit all Cloud credentials
              <Icon iconName="key" iconStyle="regular" />
            </Link>
          )}

          {isSetting && (
            <Callout.Root
              color="yellow"
              // The extended credentials are displayed below when restrictive permissions are used
              className={isUsingRestrictivePermissions ? 'my-4' : 'mt-4'}
              data-testid="mirroring-registry-credentials-warning"
            >
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextDescription className="flex flex-col gap-1">
                  The credential change won't be applied to the mirroring registry of this cluster. Make sure to update
                  the credentials properly in this cluster's mirroring registry section.
                  <ExternalLink
                    className="items-center"
                    href={`/organization/${organizationId}/cluster/${clusterId}/settings/image-registry`}
                  >
                    Go to mirroring registry section
                  </ExternalLink>
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}

          {isUsingRestrictivePermissions && (
            <Controller
              name="wide_permission_credentials"
              control={control}
              rules={{
                // The field stays registered when the toggle is turned off, so only require it while restrictive permissions are used
                validate: (value) =>
                  !getValues('using_restrictive_permissions') || Boolean(value) || 'Please select a credential.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  dataTestId="input-wide-permission-credentials"
                  label="Extended credentials"
                  hint="Only AWS role credentials can be used for extended permissions."
                  className="mb-3"
                  options={buildWidePermissionCredentials}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  isSearchable
                  menuListButton={{
                    title: 'Select credential',
                    label: 'New credential',
                    icon: <Icon iconName="circle-plus" className="text-brand" />,
                    onClick: () => openCredentialsModal(undefined, field.onChange, WIDE_PERMISSION_CREDENTIAL_TYPES),
                  }}
                />
              )}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ClusterCredentialsSettings
